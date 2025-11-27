import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Shield,
  User,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface UserDto {
  id: string;
  username: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

export function UserManagementPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<UserDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    role: "Operator",
  });

  const [editFormData, setEditFormData] = useState({
    fullName: "",
    password: "",
    isActive: true,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await loadUsers();
        setShowAddUser(false);
        setFormData({
          username: "",
          password: "",
          fullName: "",
          role: "Operator",
        });
      } else {
        const error = await response.json();
        alert(error.message || "Kullanıcı eklenemedi");
      }
    } catch (error) {
      console.error("Failed to add user:", error);
      alert("Kullanıcı eklenirken hata oluştu");
    }
  };

  const handleUpdateUser = async (userId: string, e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        await loadUsers();
        setEditingUser(null);
        setEditFormData({ fullName: "", password: "", isActive: true });
      } else {
        const error = await response.json();
        alert(error.message || "Kullanıcı güncellenemedi");
      }
    } catch (error) {
      console.error("Failed to update user:", error);
      alert("Kullanıcı güncellenirken hata oluştu");
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (
      !confirm(
        `"${username}" kullanıcısını silmek istediğinizden emin misiniz?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await loadUsers();
      } else {
        const error = await response.json();
        alert(error.message || "Kullanıcı silinemedi");
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Kullanıcı silinirken hata oluştu");
    }
  };

  const startEdit = (user: UserDto) => {
    setEditingUser(user.id);
    setEditFormData({
      fullName: user.fullName,
      password: "",
      isActive: user.isActive,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            Kullanıcı Yönetimi
          </h1>
          <p className="text-muted-foreground mt-1">
            Sistem kullanıcılarını yönetin ve operatör ekleyin
          </p>
        </div>
        <Button onClick={() => setShowAddUser(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Yeni Kullanıcı
        </Button>
      </div>

      {/* Add User Form */}
      {showAddUser && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle>Yeni Kullanıcı Ekle</CardTitle>
            <CardDescription>
              Sisteme yeni operatör veya yönetici ekleyin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kullanıcı Adı</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                    placeholder="kullanici_adi"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Şifre</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                    placeholder="En az 6 karakter"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Ad Soyad</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                  placeholder="Ad Soyad"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Rol</label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                >
                  <option value="Operator">Operatör</option>
                  <option value="Admin">Yönetici</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Kullanıcı Ekle
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddUser(false);
                    setFormData({
                      username: "",
                      password: "",
                      fullName: "",
                      role: "Operator",
                    });
                  }}
                  className="flex-1"
                >
                  İptal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Users List */}
      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-6">
              {editingUser === user.id ? (
                <form
                  onSubmit={(e) => handleUpdateUser(user.id, e)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Ad Soyad</label>
                      <input
                        type="text"
                        value={editFormData.fullName}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            fullName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Yeni Şifre (opsiyonel)
                      </label>
                      <input
                        type="password"
                        minLength={6}
                        value={editFormData.password}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            password: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                        placeholder="Boş bırakın değiştirmek için"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`active-${user.id}`}
                      checked={editFormData.isActive}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          isActive: e.target.checked,
                        })
                      }
                      className="h-4 w-4"
                    />
                    <label
                      htmlFor={`active-${user.id}`}
                      className="text-sm font-medium"
                    >
                      Aktif
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm">
                      Kaydet
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingUser(null)}
                    >
                      İptal
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      {user.role === "Admin" ? (
                        <Shield className="h-6 w-6 text-primary" />
                      ) : (
                        <User className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{user.fullName}</h3>
                        <Badge
                          variant={
                            user.role === "Admin" ? "default" : "secondary"
                          }
                        >
                          {user.role === "Admin" ? "Yönetici" : "Operatör"}
                        </Badge>
                        {user.isActive ? (
                          <Badge variant="outline" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Aktif
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Pasif
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        @{user.username}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Oluşturuldu:{" "}
                        {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                        {user.lastLoginAt && (
                          <>
                            {" "}
                            • Son giriş:{" "}
                            {new Date(user.lastLoginAt).toLocaleDateString(
                              "tr-TR"
                            )}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(user)}
                      className="gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Düzenle
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id, user.username)}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Sil
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Henüz kullanıcı eklenmemiş</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
