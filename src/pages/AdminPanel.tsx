import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import VerificationCertificate from '@/components/VerificationCertificate';

const API_URL = 'https://functions.poehali.dev/42adc41d-a9ba-4cc8-8597-2704846d1e7d';

interface VerifiedUser {
  id: number;
  unique_id: string;
  username: string;
  phone: string;
  user_id: string;
  social_networks: string[];
  status: string;
  category: string;
  created_at: string;
}

const AdminPanel = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<VerifiedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<VerifiedUser | null>(null);

  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    user_id: '',
    social_networks: '',
    status: 'active',
    category: 'general'
  });

  const fetchUsers = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить пользователей',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const socialNetworks = formData.social_networks
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          social_networks: socialNetworks
        })
      });

      if (response.ok) {
        toast({
          title: 'Успешно!',
          description: 'Пользователь верифицирован'
        });

        setFormData({
          username: '',
          phone: '',
          user_id: '',
          social_networks: '',
          status: 'active',
          category: 'general'
        });

        fetchUsers();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать пользователя',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (uniqueId: string) => {
    try {
      const response = await fetch(`${API_URL}?id=${uniqueId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: 'Удалено',
          description: 'Пользователь удалён из системы'
        });
        fetchUsers();
        if (selectedUser?.unique_id === uniqueId) {
          setSelectedUser(null);
        }
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить пользователя',
        variant: 'destructive'
      });
    }
  };

  const getCertificateUrl = (uniqueId: string) => {
    return `${window.location.origin}/certificate/${uniqueId}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Скопировано!',
      description: 'Ссылка скопирована в буфер обмена'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            VeriUserRU
          </h1>
          <p className="text-gray-600">Панель управления верификацией</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="UserPlus" size={24} />
                  Создать сертификат
                </CardTitle>
                <CardDescription>Добавьте нового верифицированного пользователя</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Юзернейм</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                      placeholder="@username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Номер телефона</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      placeholder="+7 (900) 123-45-67"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="user_id">ID пользователя</Label>
                    <Input
                      id="user_id"
                      value={formData.user_id}
                      onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                      required
                      placeholder="123456789"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="social_networks">Социальные сети (через запятую)</Label>
                    <Input
                      id="social_networks"
                      value={formData.social_networks}
                      onChange={(e) => setFormData({ ...formData, social_networks: e.target.value })}
                      placeholder="Telegram, VK, Instagram"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Статус</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Активный</SelectItem>
                        <SelectItem value="pending">В ожидании</SelectItem>
                        <SelectItem value="suspended">Приостановлен</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Каталог</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Общий</SelectItem>
                        <SelectItem value="premium">Премиум</SelectItem>
                        <SelectItem value="business">Бизнес</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    <Icon name="CheckCircle" size={20} className="mr-2" />
                    {loading ? 'Создание...' : 'Создать сертификат'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Users" size={24} />
                  Верифицированные пользователи
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {users.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Нет пользователей</p>
                  ) : (
                    users.map((user) => (
                      <div
                        key={user.id}
                        className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setSelectedUser(user)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon name="CheckCircle" size={20} className="text-primary" />
                            <span className="font-semibold">{user.username}</span>
                          </div>
                          <Badge variant="outline">{user.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{user.phone}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500 font-mono">{user.unique_id}</p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(getCertificateUrl(user.unique_id));
                              }}
                            >
                              <Icon name="Link" size={16} />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(user.unique_id);
                              }}
                            >
                              <Icon name="Trash2" size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            {selectedUser ? (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Предварительный просмотр</h2>
                  <Button
                    variant="outline"
                    onClick={() => window.open(`/certificate/${selectedUser.unique_id}`, '_blank')}
                  >
                    <Icon name="ExternalLink" size={16} className="mr-2" />
                    Открыть в новой вкладке
                  </Button>
                </div>
                <VerificationCertificate
                  username={selectedUser.username}
                  phone={selectedUser.phone}
                  userId={selectedUser.user_id}
                  uniqueId={selectedUser.unique_id}
                  socialNetworks={selectedUser.social_networks}
                  status={selectedUser.status}
                  category={selectedUser.category}
                  createdAt={selectedUser.created_at}
                  showWatermark={true}
                />
              </div>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <Icon name="FileText" size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Выберите пользователя для просмотра сертификата</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
