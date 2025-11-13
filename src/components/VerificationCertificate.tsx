import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface VerificationCertificateProps {
  username: string;
  phone: string;
  userId: string;
  uniqueId: string;
  socialNetworks: string[];
  status: string;
  category: string;
  createdAt: string;
  showWatermark?: boolean;
}

const VerificationCertificate = ({
  username,
  phone,
  userId,
  uniqueId,
  socialNetworks,
  status,
  category,
  createdAt,
  showWatermark = false
}: VerificationCertificateProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="relative w-full max-w-2xl mx-auto p-8 bg-white border-2 border-gray-200 shadow-lg overflow-hidden">
      {showWatermark && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
          <div className="relative">
            <svg width="300" height="300" viewBox="0 0 300 300" className="text-primary">
              <circle cx="150" cy="150" r="140" fill="none" stroke="currentColor" strokeWidth="8" />
              <circle cx="150" cy="150" r="120" fill="none" stroke="currentColor" strokeWidth="4" />
              <circle cx="150" cy="150" r="100" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M 120 150 L 140 170 L 180 120" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold text-primary">VU</span>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            VeriUserRU
          </h1>
          <p className="text-sm text-gray-500">Сертификат Верификации</p>
        </div>

        <div className="flex items-center justify-center gap-3 mb-8 pb-6 border-b-2 border-gray-100">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
            <Icon name="CheckCircle" size={32} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Верифицированный аккаунт
            </h2>
            <p className="text-sm text-gray-500">Подтверждено VeriUserRU</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600 font-medium">Юзернейм:</span>
            <span className="text-gray-900 font-semibold">{username}</span>
          </div>

          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600 font-medium">Телефон:</span>
            <span className="text-gray-900 font-semibold">{phone}</span>
          </div>

          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600 font-medium">ID пользователя:</span>
            <span className="text-gray-900 font-semibold">{userId}</span>
          </div>

          {socialNetworks && socialNetworks.length > 0 && (
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600 font-medium">Социальные сети:</span>
              <div className="flex gap-2 flex-wrap justify-end">
                {socialNetworks.map((network, index) => (
                  <span key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    {network}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600 font-medium">Статус:</span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
              {status}
            </span>
          </div>

          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600 font-medium">Каталог:</span>
            <span className="text-gray-900 font-semibold">{category}</span>
          </div>

          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600 font-medium">Дата создания:</span>
            <span className="text-gray-900 font-semibold">{formatDate(createdAt)}</span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t-2 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Уникальный ID сертификата:</p>
              <p className="text-lg font-bold text-gray-900 tracking-wider">{uniqueId}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <Icon name="ShieldCheck" size={24} className="text-primary" />
                <span className="text-sm font-semibold text-primary">Подтверждено</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default VerificationCertificate;
