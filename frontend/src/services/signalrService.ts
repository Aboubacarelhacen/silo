import * as signalR from '@microsoft/signalr';

let connection: signalR.HubConnection | null = null;
let connectionUsers = 0; // Track how many components are using the connection

export interface SiloUpdate {
  levelPercent: number;
  status: 'Normal' | 'Low' | 'Critical';
  timestamp: string;
}

export const createConnection = (hubUrl: string): signalR.HubConnection => {
  // If connection exists and is not disconnected, reuse it
  if (connection && connection.state !== signalR.HubConnectionState.Disconnected) {
    connectionUsers++;
    return connection;
  }

  connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl)
    .withAutomaticReconnect({
      nextRetryDelayInMilliseconds: (retryContext) => {
        // Exponential backoff: 0, 2, 10, 30 seconds, then 30s
        if (retryContext.previousRetryCount === 0) return 0;
        if (retryContext.previousRetryCount === 1) return 2000;
        if (retryContext.previousRetryCount === 2) return 10000;
        return 30000;
      }
    })
    .configureLogging(signalR.LogLevel.Information)
    .build();

  connectionUsers++;
  return connection;
};

export const startConnection = async (
  connection: signalR.HubConnection,
  onUpdate: (data: SiloUpdate) => void
): Promise<void> => {
  // Subscribe to the SiloLevelUpdated event
  connection.on('SiloLevelUpdated', onUpdate);

  // Handle reconnection
  connection.onreconnecting(() => {
    console.log('SignalR reconnecting...');
  });

  connection.onreconnected(() => {
    console.log('SignalR reconnected');
  });

  connection.onclose(() => {
    console.log('SignalR connection closed');
  });

  try {
    await connection.start();
    console.log('SignalR connected');
  } catch (err) {
    console.error('Error connecting to SignalR:', err);
    // Retry after 5 seconds
    setTimeout(() => startConnection(connection, onUpdate), 5000);
  }
};

export const stopConnection = async (conn: signalR.HubConnection): Promise<void> => {
  if (conn && conn === connection) {
    connectionUsers--;
    // Only actually stop the connection if no components are using it
    if (connectionUsers <= 0) {
      connectionUsers = 0;
      await conn.stop();
      connection = null; // Reset singleton so next createConnection makes a new one
    }
  }
};
