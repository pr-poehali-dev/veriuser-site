import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import VerificationCertificate from '@/components/VerificationCertificate';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Card, CardContent } from '@/components/ui/card';

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

const CertificateView = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<VerifiedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_URL}?id=${id}`);
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка сертификата...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-12">
            <Icon name="AlertCircle" size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Сертификат не найден</h2>
            <p className="text-gray-600 mb-6">
              Сертификат с ID <span className="font-mono font-semibold">{id}</span> не существует или был удалён
            </p>
            <Button onClick={() => window.location.href = '/'}>
              <Icon name="Home" size={20} className="mr-2" />
              На главную
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Публичный сертификат верификации
          </h1>
          <p className="text-gray-600">Подлинность подтверждена VeriUserRU</p>
        </div>

        <VerificationCertificate
          username={user.username}
          phone={user.phone}
          userId={user.user_id}
          uniqueId={user.unique_id}
          socialNetworks={user.social_networks}
          status={user.status}
          category={user.category}
          createdAt={user.created_at}
          showWatermark={false}
        />

        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => window.print()}
            >
              <Icon name="Printer" size={20} className="mr-2" />
              Распечатать
            </Button>
            <Button
              onClick={() => window.location.href = '/'}
            >
              <Icon name="Home" size={20} className="mr-2" />
              Главная страница
            </Button>
          </div>
        </div>

        <div className="mt-8 max-w-2xl mx-auto">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="py-6">
              <div className="flex gap-4">
                <Icon name="Info" size={24} className="text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Как проверить подлинность?</h3>
                  <p className="text-sm text-gray-600">
                    Каждый сертификат имеет уникальный ID: <span className="font-mono font-semibold">{user.unique_id}</span>
                    <br />
                    Вы можете проверить подлинность, сравнив ID на сертификате с ID в адресной строке браузера.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CertificateView;
