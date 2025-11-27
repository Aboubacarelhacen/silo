using Opc.Ua;
using Opc.Ua.Client;
using Opc.Ua.Configuration;

namespace SiloBackend.Services;

public class RealOpcUaSiloDataSource : ISiloDataSource, IDisposable
{
    private readonly ILogger<RealOpcUaSiloDataSource> _logger;
    private readonly string _endpointUrl;
    private readonly string _siloLevelNodeId;
    private readonly string _temperatureNodeId;
    private Opc.Ua.Client.ISession? _session;
    private readonly SemaphoreSlim _sessionLock = new(1, 1);
    private ApplicationConfiguration? _appConfig;

    public RealOpcUaSiloDataSource(
        IConfiguration configuration,
        ILogger<RealOpcUaSiloDataSource> logger)
    {
        _logger = logger;
        _endpointUrl = configuration["OpcUa:EndpointUrl"]
            ?? throw new InvalidOperationException("OpcUa:EndpointUrl not configured");
        _siloLevelNodeId = configuration["OpcUa:SiloLevelNodeId"]
            ?? throw new InvalidOperationException("OpcUa:SiloLevelNodeId not configured");
        _temperatureNodeId = configuration["OpcUa:TemperatureNodeId"]
            ?? throw new InvalidOperationException("OpcUa:TemperatureNodeId not configured");
    }

    public async Task<double> GetCurrentLevelAsync(CancellationToken ct = default)
    {
        await EnsureSessionAsync(ct);

        if (_session == null || !_session.Connected)
        {
            _logger.LogError("Session is not connected after ensure");
            throw new InvalidOperationException("OPC UA session not connected");
        }

        try
        {
            var nodeId = NodeId.Parse(_siloLevelNodeId);
            var readValue = new ReadValueId
            {
                NodeId = nodeId,
                AttributeId = Attributes.Value
            };

            var nodesToRead = new ReadValueIdCollection { readValue };
            _session.Read(
                null,
                0,
                TimestampsToReturn.Neither,
                nodesToRead,
                out var results,
                out var diagnosticInfos);

            ClientBase.ValidateResponse(results, nodesToRead);
            ClientBase.ValidateDiagnosticInfos(diagnosticInfos, nodesToRead);

            if (StatusCode.IsBad(results[0].StatusCode))
            {
                _logger.LogError("Bad status code when reading node: {StatusCode}", results[0].StatusCode);
                throw new InvalidOperationException($"Failed to read node: {results[0].StatusCode}");
            }

            var value = results[0].Value;
            if (value == null)
            {
                _logger.LogWarning("Read returned null value");
                return 0.0;
            }

            var level = Convert.ToDouble(value);
            _logger.LogDebug("Read level: {Level}%", level);
            return level;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reading OPC UA node");

            // Invalidate session on read error
            await _sessionLock.WaitAsync(ct);
            try
            {
                _session?.Close();
                _session?.Dispose();
                _session = null;
            }
            finally
            {
                _sessionLock.Release();
            }

            throw;
        }
    }

    public async Task<double> GetCurrentTemperatureAsync(CancellationToken ct = default)
    {
        await EnsureSessionAsync(ct);

        if (_session == null || !_session.Connected)
        {
            _logger.LogError("Session is not connected");
            throw new InvalidOperationException("OPC UA session not connected");
        }

        try
        {
            var nodeId = NodeId.Parse(_temperatureNodeId);
            var readValue = new ReadValueId
            {
                NodeId = nodeId,
                AttributeId = Attributes.Value
            };

            var nodesToRead = new ReadValueIdCollection { readValue };
            _session.Read(
                null,
                0,
                TimestampsToReturn.Neither,
                nodesToRead,
                out var results,
                out var diagnosticInfos);

            ClientBase.ValidateResponse(results, nodesToRead);
            ClientBase.ValidateDiagnosticInfos(diagnosticInfos, nodesToRead);

            if (StatusCode.IsBad(results[0].StatusCode))
            {
                _logger.LogError("Bad status code reading temperature: {StatusCode}", results[0].StatusCode);
                throw new InvalidOperationException($"Failed to read node: {results[0].StatusCode}");
            }

            var value = results[0].Value;
            if (value == null)
            {
                _logger.LogWarning("Temperature read returned null value");
                return 0.0;
            }

            var temperature = Convert.ToDouble(value);
            _logger.LogDebug("Read temperature: {Temp}°C", temperature);
            return temperature;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reading OPC UA temperature node");

            // Invalidate session on read error
            await _sessionLock.WaitAsync(ct);
            try
            {
                _session?.Close();
                _session?.Dispose();
                _session = null;
            }
            finally
            {
                _sessionLock.Release();
            }

            throw;
        }
    }

    private async Task EnsureSessionAsync(CancellationToken ct)
    {
        if (_session != null && _session.Connected)
            return;

        await _sessionLock.WaitAsync(ct);
        try
        {
            // Double-check after acquiring lock
            if (_session != null && _session.Connected)
                return;

            _logger.LogInformation("Creating OPC UA session to {EndpointUrl}", _endpointUrl);

            // Close old session if exists
            if (_session != null)
            {
                try
                {
                    _session.Close();
                    _session.Dispose();
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Error closing old session");
                }
                _session = null;
            }

            // Build application configuration
            if (_appConfig == null)
            {
                _appConfig = new ApplicationConfiguration
                {
                    ApplicationName = "SiloBackend",
                    ApplicationType = ApplicationType.Client,
                    SecurityConfiguration = new SecurityConfiguration
                    {
                        ApplicationCertificate = new CertificateIdentifier(),
                        AutoAcceptUntrustedCertificates = true,
                        RejectSHA1SignedCertificates = false
                    },
                    TransportConfigurations = new TransportConfigurationCollection(),
                    TransportQuotas = new TransportQuotas { OperationTimeout = 15000 },
                    ClientConfiguration = new ClientConfiguration { DefaultSessionTimeout = 60000 },
                    TraceConfiguration = new TraceConfiguration()
                };

                await _appConfig.Validate(ApplicationType.Client);
            }

            // Discover endpoints
            var endpointDescription = CoreClientUtils.SelectEndpoint(
                _endpointUrl,
                useSecurity: false,
                15000);

            // Create endpoint configuration
            var endpointConfiguration = EndpointConfiguration.Create(_appConfig);
            var endpoint = new ConfiguredEndpoint(
                null,
                endpointDescription,
                endpointConfiguration);

            // Create session
            _session = await Opc.Ua.Client.Session.Create(
                _appConfig,
                endpoint,
                updateBeforeConnect: false,
                checkDomain: false,
                sessionName: "SiloBackendSession",
                sessionTimeout: 60000,
                identity: new UserIdentity(new AnonymousIdentityToken()),
                preferredLocales: null);

            _logger.LogInformation("OPC UA session created successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create OPC UA session");
            throw;
        }
        finally
        {
            _sessionLock.Release();
        }
    }

    public void Dispose()
    {
        try
        {
            _session?.Close();
            _session?.Dispose();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error disposing session");
        }

        _sessionLock.Dispose();
    }
}
