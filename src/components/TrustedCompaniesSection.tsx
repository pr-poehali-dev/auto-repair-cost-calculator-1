import Icon from "@/components/ui/icon";

const TrustedCompaniesSection = () => {
  const companies = [
    { name: "Яндекс", industry: "IT" },
    { name: "Сбербанк", industry: "Финансы" },
    { name: "Газпром", industry: "Энергетика" },
    { name: "Росатом", industry: "Атомная энергия" },
    { name: "Лукойл", industry: "Нефтегаз" },
    { name: "МТС", industry: "Телеком" }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm text-gray-600 uppercase tracking-wide font-medium mb-4">
            Нам доверяют
          </p>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ведущие компании России
          </h2>
          <p className="text-lg text-gray-600">
            Более 10,000 компаний выбирают нашу платформу для развития бизнеса
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
          {companies.map((company, index) => (
            <div 
              key={index}
              className="group flex flex-col items-center p-6 bg-white rounded-lg hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-teal-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Icon name="Building2" size={24} className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-center mb-1">{company.name}</h3>
              <p className="text-xs text-gray-500 text-center">{company.industry}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center">
              <Icon name="Shield" size={16} className="text-green-600 mr-2" />
              100% безопасность данных
            </div>
            <div className="flex items-center">
              <Icon name="Clock" size={16} className="text-blue-600 mr-2" />
              Круглосуточная поддержка
            </div>
            <div className="flex items-center">
              <Icon name="Award" size={16} className="text-purple-600 mr-2" />
              ISO 27001 сертификация
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedCompaniesSection;