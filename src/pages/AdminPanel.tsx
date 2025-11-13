import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import VerificationCertificate from '@/components/VerificationCertificate';
import { loadUsers, addUser, deleteUser, updateUser, exportData, importData, type VerifiedUser } from '@/lib/localStorage';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface SocialNetwork {
  name: string;
  url: string;
}

const AdminPanel = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [users, setUsers] = useState<VerifiedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<VerifiedUser | null>(null);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<VerifiedUser | null>(null);

  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    user_id: '',
    status: '',
    category: ''
  });

  const [socialNetworks, setSocialNetworks] = useState<SocialNetwork[]>([{ name: '', url: '' }]);
  const [customStatus, setCustomStatus] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [availableStatuses, setAvailableStatuses] = useState<string[]>(['Активный', 'В ожидании', 'Приостановлен']);
  const [availableCategories, setAvailableCategories] = useState<string[]>(['Общий', 'Премиум', 'Бизнес', 'VIP']);

  useEffect(() => {
    setUsers(loadUsers());
  }, []);

  const addSocialNetwork = () => {
    setSocialNetworks([...socialNetworks, { name: '', url: '' }]);
  };

  const removeSocialNetwork = (index: number) => {
    setSocialNetworks(socialNetworks.filter((_, i) => i !== index));
  };

  const updateSocialNetwork = (index: number, field: 'name' | 'url', value: string) => {
    const updated = [...socialNetworks];
    updated[index][field] = value;
    setSocialNetworks(updated);
  };

  const addCustomStatus = () => {
    if (customStatus.trim() && !availableStatuses.includes(customStatus.trim())) {
      setAvailableStatuses([...availableStatuses, customStatus.trim()]);
      setFormData({ ...formData, status: customStatus.trim() });
      setCustomStatus('');
    }
  };

  const addCustomCategory = () => {
    if (customCategory.trim() && !availableCategories.includes(customCategory.trim())) {
      setAvailableCategories([...availableCategories, customCategory.trim()]);
      setFormData({ ...formData, category: customCategory.trim() });
      setCustomCategory('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validSocialNetworks = socialNetworks.filter(sn => sn.name.trim() && sn.url.trim());

      const newUser = addUser({
        ...formData,
        social_networks: validSocialNetworks
      });

      toast({
        title: 'Успешно!',
        description: 'Пользователь верифицирован'
      });

      setFormData({
        username: '',
        phone: '',
        user_id: '',
        status: '',
        category: ''
      });
      setSocialNetworks([{ name: '', url: '' }]);
      setUsers(loadUsers());
      setSelectedUser(newUser);
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

  const handleEdit = (user: VerifiedUser) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      phone: user.phone,
      user_id: user.user_id,
      status: user.status,
      category: user.category
    });
    setSocialNetworks(user.social_networks.length > 0 ? user.social_networks : [{ name: '', url: '' }]);
    setEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setLoading(true);
    try {
      const validSocialNetworks = socialNetworks.filter(sn => sn.name.trim() && sn.url.trim());

      const updated = updateUser(editingUser.unique_id, {
        ...formData,
        social_networks: validSocialNetworks
      });

      if (updated) {
        toast({
          title: 'Обновлено!',
          description: 'Данные пользователя обновлены'
        });

        setUsers(loadUsers());
        setSelectedUser(updated);
        setEditDialogOpen(false);
        setEditingUser(null);

        setFormData({
          username: '',
          phone: '',
          user_id: '',
          status: '',
          category: ''
        });
        setSocialNetworks([{ name: '', url: '' }]);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить пользователя',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (uniqueId: string) => {
    if (deleteUser(uniqueId)) {
      toast({
        title: 'Удалено',
        description: 'Пользователь удалён из системы'
      });
      setUsers(loadUsers());
      if (selectedUser?.unique_id === uniqueId) {
        setSelectedUser(null);
      }
    } else {
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

  const exportToPDF = async () => {
    if (!selectedUser) return;

    setExportingPDF(true);
    try {
      const element = document.getElementById('certificate-content');
      if (!element) {
        throw new Error('Certificate element not found');
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 10, imgWidth, imgHeight);
      pdf.save(`certificate-${selectedUser.unique_id}.pdf`);

      toast({
        title: 'Готово!',
        description: 'Сертификат сохранён в PDF'
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось экспортировать в PDF',
        variant: 'destructive'
      });
    } finally {
      setExportingPDF(false);
    }
  };

  const handleExportData = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `veriuser-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Экспортировано!',
      description: 'Данные сохранены в файл'
    });
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (importData(content)) {
        setUsers(loadUsers());
        toast({
          title: 'Импортировано!',
          description: 'Данные успешно загружены'
        });
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить данные',
          variant: 'destructive'
        });
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              VeriUserRU
            </h1>
            <p className="text-gray-600">Панель управления верификацией</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportData}>
              <Icon name="Download" size={20} className="mr-2" />
              Экспорт данных
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Icon name="Upload" size={20} className="mr-2" />
              Импорт данных
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
          </div>
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
                    <div className="flex items-center justify-between">
                      <Label>Социальные сети</Label>
                      <Button type="button" size="sm" variant="outline" onClick={addSocialNetwork}>
                        <Icon name="Plus" size={16} className="mr-1" />
                        Добавить
                      </Button>
                    </div>
                    {socialNetworks.map((sn, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="Название (Telegram)"
                          value={sn.name}
                          onChange={(e) => updateSocialNetwork(index, 'name', e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          placeholder="https://t.me/username"
                          value={sn.url}
                          onChange={(e) => updateSocialNetwork(index, 'url', e.target.value)}
                          className="flex-1"
                        />
                        {socialNetworks.length > 1 && (
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            onClick={() => removeSocialNetwork(index)}
                          >
                            <Icon name="X" size={16} />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label>Статус</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Добавить новый статус"
                        value={customStatus}
                        onChange={(e) => setCustomStatus(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomStatus())}
                      />
                      <Button type="button" size="sm" onClick={addCustomStatus}>
                        <Icon name="Plus" size={16} />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {availableStatuses.map((status) => (
                        <Badge
                          key={status}
                          variant={formData.status === status ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => setFormData({ ...formData, status })}
                        >
                          {status}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Каталог</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Добавить новый каталог"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomCategory())}
                      />
                      <Button type="button" size="sm" onClick={addCustomCategory}>
                        <Icon name="Plus" size={16} />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {availableCategories.map((category) => (
                        <Badge
                          key={category}
                          variant={formData.category === category ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => setFormData({ ...formData, category })}
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>
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
                            <div className="w-5 h-5 flex-shrink-0">
                              <img 
                                src="https://cdn.poehali.dev/files/a0dd6f24-4292-4754-ba2e-ee1070d392d3.png" 
                                alt="Verified" 
                                className="w-full h-full object-contain"
                              />
                            </div>
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
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(user);
                              }}
                            >
                              <Icon name="Edit" size={16} />
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
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={exportToPDF}
                      disabled={exportingPDF}
                    >
                      <Icon name="FileDown" size={16} className="mr-2" />
                      {exportingPDF ? 'Экспорт...' : 'Скачать PDF'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.open(`/certificate/${selectedUser.unique_id}`, '_blank')}
                    >
                      <Icon name="ExternalLink" size={16} className="mr-2" />
                      Открыть
                    </Button>
                  </div>
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
                  isPdfExport={exportingPDF}
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

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать сертификат</DialogTitle>
            <DialogDescription>Измените данные верифицированного пользователя</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-username">Юзернейм</Label>
              <Input
                id="edit-username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phone">Номер телефона</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-user_id">ID пользователя</Label>
              <Input
                id="edit-user_id"
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Социальные сети</Label>
                <Button type="button" size="sm" variant="outline" onClick={addSocialNetwork}>
                  <Icon name="Plus" size={16} className="mr-1" />
                  Добавить
                </Button>
              </div>
              {socialNetworks.map((sn, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Название"
                    value={sn.name}
                    onChange={(e) => updateSocialNetwork(index, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="https://..."
                    value={sn.url}
                    onChange={(e) => updateSocialNetwork(index, 'url', e.target.value)}
                    className="flex-1"
                  />
                  {socialNetworks.length > 1 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      onClick={() => removeSocialNetwork(index)}
                    >
                      <Icon name="X" size={16} />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Статус</Label>
              <div className="flex flex-wrap gap-2">
                {availableStatuses.map((status) => (
                  <Badge
                    key={status}
                    variant={formData.status === status ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setFormData({ ...formData, status })}
                  >
                    {status}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Каталог</Label>
              <div className="flex flex-wrap gap-2">
                {availableCategories.map((category) => (
                  <Badge
                    key={category}
                    variant={formData.category === category ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setFormData({ ...formData, category })}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Отмена
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Сохранение...' : 'Сохранить изменения'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
