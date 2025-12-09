
import React, { useState, useMemo } from 'react';
import { useClinic } from '../context';
import { Service, Professional, ServiceCategory } from '../types';
import { ClockIcon, PriceIcon, UserIcon, CalendarIcon, ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon, XCircleIcon, WhatsAppIcon, InstagramIcon, GoogleIcon, StarIcon, XIcon } from './icons';

// --- BOOKING MODAL COMPONENTS (FROM OLD VIEW) ---

type BookingStep = 'service' | 'professional' | 'datetime' | 'clientInfo' | 'confirm' | 'success';

const BookingFlow: React.FC<{onClose: () => void}> = ({onClose}) => {
    const [step, setStep] = useState<BookingStep>('service');
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedTime, setSelectedTime] = useState<Date | null>(null);
    const [clientInfo, setClientInfo] = useState<{name: string, phone: string, email: string} | null>(null);
    const { addAppointment, findOrCreateClient } = useClinic();

    const handleSelectService = (service: Service) => { setSelectedService(service); setStep('professional'); };
    const handleSelectProfessional = (professional: Professional) => { setSelectedProfessional(professional); setStep('datetime'); };
    const handleSelectTime = (time: Date) => { setSelectedTime(time); setStep('clientInfo'); };
    const handleClientInfoSubmit = (details: {name: string, phone: string, email: string}) => {
        setClientInfo(details);
        setStep('confirm');
    };

    const handleConfirmBooking = () => {
        if (selectedService && selectedProfessional && selectedTime && clientInfo) {
            const client = findOrCreateClient({
                name: clientInfo.name,
                phone: clientInfo.phone,
                email: clientInfo.email,
            });

            addAppointment({
                clientId: client.id,
                professionalId: selectedProfessional.id,
                serviceId: selectedService.id,
                startTime: selectedTime,
            });
            setStep('success');
        }
    };
    
    const resetFlow = () => {
        setStep('service');
        setSelectedService(null);
        setSelectedProfessional(null);
        setSelectedDate(new Date());
        setSelectedTime(null);
        setClientInfo(null);
        onClose();
    }
    
    const renderStepContent = () => {
        switch (step) {
            case 'service':
                return <ServiceSelector onSelectService={handleSelectService} />;
            case 'professional':
                return <ProfessionalSelector service={selectedService!} onSelectProfessional={handleSelectProfessional} onBack={() => setStep('service')} />;
            case 'datetime':
                return <DateTimePicker service={selectedService!} professional={selectedProfessional!} date={selectedDate} setDate={setSelectedDate} onSelectTime={handleSelectTime} onBack={() => setStep('professional')} />;
            case 'clientInfo':
                return <ClientInfoForm onConfirm={handleClientInfoSubmit} onBack={() => setStep('datetime')} />;
            case 'confirm':
                return <Confirmation clientInfo={clientInfo!} service={selectedService!} professional={selectedProfessional!} time={selectedTime!} onConfirm={handleConfirmBooking} onBack={() => setStep('clientInfo')} />;
            case 'success':
                return <Success onNewBooking={resetFlow} />;
        }
    };
    
    return (
        <div className="p-2 sm:p-4">
             <h2 className="text-3xl font-bold text-stone-800 mb-2">Novo Agendamento</h2>
             <p className="text-stone-500 mb-8">Siga os passos para garantir seu horário.</p>
            {renderStepContent()}
        </div>
    );
};

const ServiceSelector: React.FC<{ onSelectService: (service: Service) => void }> = ({ onSelectService }) => {
    const { services } = useClinic();
    return (
        <div>
            <h3 className="text-xl font-semibold mb-4 text-pink-500">1. Escolha o Serviço</h3>
            <div className="grid md:grid-cols-2 gap-4">
                {services.map(service => (
                    <div key={service.id} onClick={() => onSelectService(service)} className="bg-stone-50 p-4 rounded-lg border border-stone-200 hover:border-pink-300 hover:shadow-lg cursor-pointer transition-all duration-300">
                        <h4 className="font-bold text-stone-700">{service.name}</h4>
                        <div className="flex items-center text-sm text-stone-500 mt-2 space-x-4">
                            <span className="flex items-center"><ClockIcon className="w-4 h-4 mr-1 text-pink-400" /> {service.duration} min</span>
                            <span className="flex items-center"><PriceIcon className="w-4 h-4 mr-1 text-pink-400" /> R$ {service.price},00</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ProfessionalSelector: React.FC<{ service: Service, onSelectProfessional: (professional: Professional) => void, onBack: () => void }> = ({ service, onSelectProfessional, onBack }) => {
    const { professionals } = useClinic();
    const availableProfessionals = professionals.filter(p => p.availableServices.includes(service.id));
    return (
        <div>
            <div className="flex items-center mb-4">
                 <button onClick={onBack} className="p-2 rounded-full hover:bg-stone-100 mr-3"><ChevronLeftIcon className="w-5 h-5 text-stone-600" /></button>
                 <h3 className="text-xl font-semibold text-pink-500">2. Escolha o Profissional</h3>
            </div>
            <p className="mb-6 text-stone-500">Profissionais disponíveis para <span className="font-semibold text-stone-700">{service.name}</span>.</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableProfessionals.map(prof => (
                    <div key={prof.id} onClick={() => onSelectProfessional(prof)} className="bg-stone-50 p-4 rounded-lg border border-stone-200 hover:border-pink-300 hover:shadow-lg cursor-pointer transition-all duration-300 text-center">
                         <UserIcon className="w-12 h-12 mx-auto text-pink-300 mb-3" />
                        <h4 className="font-bold text-stone-700">{prof.name}</h4>
                        <p className="text-sm text-stone-500">{prof.role}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const DateTimePicker: React.FC<{ service: Service, professional: Professional, date: Date, setDate: (date: Date) => void, onSelectTime: (time: Date) => void, onBack: () => void }> = ({ service, professional, date, setDate, onSelectTime, onBack }) => {
    const { getAvailableSlots } = useClinic();
    const availableSlots = getAvailableSlots(professional.id, service.id, date);
    const changeDay = (amount: number) => {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + amount);
        setDate(newDate);
    };

    return (
        <div>
            <div className="flex items-center mb-4">
                 <button onClick={onBack} className="p-2 rounded-full hover:bg-stone-100 mr-3"><ChevronLeftIcon className="w-5 h-5 text-stone-600" /></button>
                 <h3 className="text-xl font-semibold text-pink-500">3. Escolha a Data e Horário</h3>
            </div>
            <div className="bg-stone-100 p-4 rounded-lg mb-6">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => changeDay(-1)} className="p-2 rounded-full hover:bg-stone-200"><ChevronLeftIcon className="w-6 h-6" /></button>
                    <h4 className="text-lg font-semibold text-center">{date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</h4>
                    <button onClick={() => changeDay(1)} className="p-2 rounded-full hover:bg-stone-200"><ChevronRightIcon className="w-6 h-6" /></button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {availableSlots.length > 0 ? availableSlots.map(slot => (
                        <button key={slot.toISOString()} onClick={() => onSelectTime(slot)} className="bg-white p-3 rounded-md text-center font-semibold text-pink-600 hover:bg-pink-400 hover:text-white transition-all duration-200 shadow-sm border border-stone-200">
                            {slot.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </button>
                    )) : (<p className="col-span-full text-center text-stone-500 py-4">Nenhum horário disponível.</p>)}
                </div>
            </div>
        </div>
    );
};

const ClientInfoForm: React.FC<{
    onConfirm: (details: { name: string; phone: string; email: string }) => void;
    onBack: () => void;
}> = ({ onConfirm, onBack }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm({ name, phone, email });
    };

    return (
        <div>
            <div className="flex items-center mb-4">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-stone-100 mr-3"><ChevronLeftIcon className="w-5 h-5 text-stone-600" /></button>
                <h3 className="text-xl font-semibold text-pink-500">4. Seus Dados</h3>
            </div>
            <p className="mb-6 text-stone-500">Preencha seus dados para finalizar o agendamento.</p>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
                <div>
                    <label htmlFor="client-name" className="block text-sm font-medium text-stone-700">Nome Completo</label>
                    <input type="text" id="client-name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500" />
                </div>
                <div>
                    <label htmlFor="client-phone" className="block text-sm font-medium text-stone-700">Telefone (WhatsApp)</label>
                    <input type="tel" id="client-phone" value={phone} onChange={e => setPhone(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500" />
                </div>
                <div>
                    <label htmlFor="client-email" className="block text-sm font-medium text-stone-700">Email (Opcional)</label>
                    <input type="email" id="client-email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500" />
                </div>
                <div className="pt-4 text-right">
                    <button type="submit" className="bg-pink-500 text-white font-bold py-3 px-8 rounded-full hover:bg-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl">
                        Continuar
                    </button>
                </div>
            </form>
        </div>
    );
};

const Confirmation: React.FC<{ clientInfo: { name: string }, service: Service, professional: Professional, time: Date, onConfirm: () => void, onBack: () => void }> = ({ clientInfo, service, professional, time, onConfirm, onBack }) => {
    return (
        <div>
             <div className="flex items-center mb-4">
                 <button onClick={onBack} className="p-2 rounded-full hover:bg-stone-100 mr-3"><ChevronLeftIcon className="w-5 h-5 text-stone-600" /></button>
                 <h3 className="text-xl font-semibold text-pink-500">5. Confirme seu Agendamento</h3>
            </div>
            <div className="bg-stone-50 border border-pink-200 p-6 rounded-lg space-y-4">
                <div className="pb-4 border-b"><h4 className="font-bold text-lg text-stone-700">{service.name}</h4><p className="text-stone-500">com <span className="font-semibold">{professional.name}</span></p></div>
                <div className="flex items-center text-stone-600"><UserIcon className="w-5 h-5 mr-3 text-pink-400" /><span className="font-semibold">{clientInfo.name}</span></div>
                <div className="flex items-center text-stone-600"><CalendarIcon className="w-5 h-5 mr-3 text-pink-400" /><span className="font-semibold">{time.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</span></div>
                <div className="flex items-center text-stone-600"><ClockIcon className="w-5 h-5 mr-3 text-pink-400" /><span className="font-semibold">{time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span></div>
                <div className="flex items-center text-stone-600"><PriceIcon className="w-5 h-5 mr-3 text-pink-400" /><span className="font-semibold">R$ {service.price},00</span></div>
            </div>
            <div className="mt-8 text-right"><button onClick={onConfirm} className="bg-pink-500 text-white font-bold py-3 px-8 rounded-full hover:bg-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl">Confirmar</button></div>
        </div>
    )
};

const Success: React.FC<{onNewBooking: () => void}> = ({onNewBooking}) => {
    return (
        <div className="text-center py-10"><CheckCircleIcon className="w-24 h-24 text-green-500 mx-auto mb-4" /><h3 className="text-2xl font-bold text-stone-800">Agendamento Confirmado!</h3><p className="text-stone-500 mt-2 mb-8">Seu horário foi reservado com sucesso.</p><button onClick={onNewBooking} className="bg-pink-500 text-white font-bold py-3 px-8 rounded-full hover:bg-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl">Fechar</button></div>
    )
}

// --- LANDING PAGE COMPONENTS ---

const NavLink: React.FC<{href: string; children: React.ReactNode}> = ({href, children}) => {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const targetId = href.replace('#', '');
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            const headerHeight = 80; // From App.tsx header h-20 (5rem = 80px)
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerHeight;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };
    
    return (
        <a href={href} onClick={handleClick} className="text-stone-600 hover:text-pink-500 transition-colors duration-300 font-medium">
            {children}
        </a>
    );
};

const CTAButton: React.FC<{onClick: () => void; children: React.ReactNode, className?: string}> = ({ onClick, children, className }) => (
    <button onClick={onClick} className={`bg-pink-500 text-white font-bold py-3 px-8 rounded-full hover:bg-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${className}`}>
        {children}
    </button>
);

const Section: React.FC<{id: string, children: React.ReactNode, className?: string}> = ({id, children, className}) => (
    <section id={id} className={`py-16 sm:py-24 ${className}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {children}
        </div>
    </section>
);

const SectionTitle: React.FC<{subtitle: string, title: string}> = ({subtitle, title}) => (
    <div className="text-center mb-12">
        <span className="text-pink-500 font-semibold tracking-wider uppercase">{subtitle}</span>
        <h2 className="text-4xl sm:text-5xl font-bold text-stone-800 mt-2">{title}</h2>
    </div>
);

const ClientView: React.FC = () => {
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const { services, professionals } = useClinic();

    const portfolioImages = [
        'https://images.unsplash.com/photo-1599386378553-832a84547631?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzOTk5MDB8MHwxfGFsbHx8fHx8fHx8fDE3MTc5NTg3ODd8&ixlib=rb-4.0.3&q=75&w=400',
        'https://images.unsplash.com/photo-1593922373329-1b3d8507c8a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzOTk5MDB8MHwxfGFsbHx8fHx8fHx8fDE3MTc5NTg4ODB8&ixlib=rb-4.0.3&q=75&w=400',
        'https://images.unsplash.com/photo-1620892251369-f8a034d61841?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzOTk5MDB8MHwxfGFsbHx8fHx8fHx8fDE3MTc5NTg5MjR8&ixlib=rb-4.0.3&q=75&w=400',
    ];
     const clinicImages = [
        'https://images.unsplash.com/photo-1556742518-a6e5a2b3f1a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzOTk5MDB8MHwxfGFsbHx8fHx8fHx8fDE3MTc5NTg5ODd8&ixlib=rb-4.0.3&q=75&w=400',
        'https://images.unsplash.com/photo-1631217872990-b911c42f0435?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzOTk5MDB8MHwxfGFsbHx8fHx8fHx8fDE3MTc5NTkwMTl8&ixlib=rb-4.0.3&q=75&w=400',
        'https://images.unsplash.com/photo-1576086213369-97a306d36557?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzOTk5MDB8MHwxfGFsbHx8fHx8fHx8fDE3MTc5NTkwNTF8&ixlib=rb-4.0.3&q=75&w=400',
    ];
    const testimonials = [
        { platform: 'Google', user: 'Carla M.', text: 'Atendimento incrível e super profissional. A Tainá tem mãos de fada!', rating: 5 },
        { platform: 'Instagram', user: '@julianapaiva', text: 'Amei meu piercing novo! Ficou perfeito e o cuidado no atendimento fez toda a diferença.', rating: 5 },
        { platform: 'Google', user: 'Fernanda L.', text: 'Levei minha filha para o primeiro furo e foi super tranquilo. Recomendo de olhos fechados!', rating: 5 },
    ];

    const newsArticles = [
      {
        tag: 'Tendências',
        title: 'As Novas Tendências em Piercings Auriculares para 2024',
        description: 'O minimalismo e o uso de ouro estão em alta, transformando a orelha em uma verdadeira obra de arte com o conceito de "curated ear".',
        imageUrl: 'https://images.unsplash.com/photo-1616199958933-255c2765369e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzOTk5MDB8MHwxfGFsbHx8fHx8fHx8fDE3MTgyOTg3MzV8&ixlib=rb-4.0.3&q=75&w=500',
      },
      {
        tag: 'Procedimentos',
        title: 'Reconstrução de Lóbulo: A Solução para Orelhas Danificadas',
        description: 'Saiba mais sobre o procedimento seguro e eficaz que repara lóbulos rasgados por brincos pesados ou acidentes, restaurando a estética da orelha.',
        imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba9996a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzOTk5MDB8MHwxfGFsbHx8fHx8fHx8fDE3MTgyOTg4MDZ8&ixlib=rb-4.0.3&q=75&w=500',
      },
      {
        tag: 'Cuidados',
        title: 'Cuidados Pós-Piercing: Dicas para uma Cicatrização Perfeita',
        description: 'A cicatrização correta é crucial. Aprenda com especialistas as melhores práticas de limpeza e os sinais de alerta para garantir um resultado impecável.',
        imageUrl: 'https://images.unsplash.com/photo-1620917669793-02911b3a5d0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzOTk5MDB8MHwxfGFsbHx8fHx8fHx8fDE3MTgyOTg5MTZ8&ixlib=rb-4.0.3&q=75&w=500',
      }
    ];
    
    return (
        <div className="bg-white">
            <nav className="hidden sm:flex container mx-auto px-6 lg:px-8 py-4 items-center justify-center space-x-8">
                <NavLink href="#inicio">Início</NavLink>
                <NavLink href="#servicos">Serviços</NavLink>
                <NavLink href="#sobre">Sobre</NavLink>
                <NavLink href="#portfolio">Portfólio</NavLink>
                <NavLink href="#noticias">Notícias</NavLink>
                <NavLink href="#contato">Contato</NavLink>
            </nav>
            
            {/* Hero */}
            <header id="inicio" className="relative h-[80vh] min-h-[500px] flex items-center justify-center text-center text-white bg-gradient-to-t from-pink-200 to-white">
                 <div className="absolute inset-0 bg-black opacity-10"></div>
                 <div className="relative z-10 px-4">
                     <h1 className="text-5xl md:text-7xl font-bold text-stone-800" style={{textShadow: '0px 2px 10px rgba(255,255,255,0.5)'}}>Arte e Precisão em Estética Auricular</h1>
                     <p className="text-xl md:text-2xl mt-4 text-stone-600 max-w-3xl mx-auto">Elevando sua autoestima com procedimentos seguros, humanizados e com a mais alta tecnologia.</p>
                     <CTAButton onClick={() => setIsBookingOpen(true)} className="mt-8">Agendar Agora</CTAButton>
                 </div>
            </header>

            {/* Services */}
            <Section id="servicos" className="bg-stone-50">
                <SectionTitle subtitle="Nossas Especialidades" title="Serviços Oferecidos" />
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map(service => (
                        <div key={service.id} className="bg-white p-8 rounded-lg shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                            <h3 className="text-2xl font-bold text-stone-800">{service.name}</h3>
                            <p className="text-pink-500 font-semibold mt-1">{service.category}</p>
                            <div className="flex items-baseline text-3xl font-bold text-stone-700 my-4">
                                R${service.price}<span className="text-sm font-normal text-stone-500">,00</span>
                            </div>
                            <p className="text-stone-500 text-sm">Duração: {service.duration} minutos</p>
                            <button onClick={() => setIsBookingOpen(true)} className="w-full mt-6 bg-stone-100 text-stone-700 font-bold py-3 rounded-full hover:bg-pink-100 hover:text-pink-600 transition-colors duration-300">
                                Agendar este Serviço
                            </button>
                        </div>
                    ))}
                </div>
            </Section>

            {/* About */}
            <Section id="sobre">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                    <div className="lg:w-1/2">
                        <img 
                            src="https://images.unsplash.com/photo-1596384898247-c03a315b9c24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzOTk5MDB8MHwxfGFsbHx8fHx8fHx8fDE3MTc5NTg4NDV8&ixlib=rb-4.0.3&q=75&w=800" 
                            alt="Tainá Batista" 
                            className="rounded-lg shadow-2xl w-full" 
                            loading="lazy"
                            decoding="async"
                        />
                    </div>
                    <div className="lg:w-1/2">
                        <span className="text-pink-500 font-semibold tracking-wider uppercase">Nossa Missão</span>
                        <h2 className="text-4xl sm:text-5xl font-bold text-stone-800 mt-2">Cuidado que Transforma</h2>
                        <p className="mt-6 text-stone-600 leading-relaxed">[Descrição de valores da empresa] Nosso compromisso é com sua segurança, bem-estar e satisfação. Utilizamos materiais de alta qualidade, técnicas assépticas rigorosas e um atendimento que respeita sua individualidade, garantindo uma experiência única e resultados que realçam sua beleza natural.</p>
                    </div>
                </div>
            </Section>
            
            {/* Portfolio */}
            <Section id="portfolio" className="bg-stone-50">
                <SectionTitle subtitle="Resultados" title="Nosso Portfólio" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {portfolioImages.map((src, index) => <img key={index} src={src} alt={`Portfolio ${index+1}`} className="rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 aspect-square object-cover" loading="lazy" decoding="async" />)}
                </div>
            </Section>

            {/* News Section */}
            <Section id="noticias">
              <SectionTitle subtitle="Fique por Dentro" title="Últimas Notícias" />
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {newsArticles.map((article, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden group transform hover:-translate-y-2 transition-all duration-300">
                    <img 
                        src={article.imageUrl} 
                        alt={article.title} 
                        className="w-full h-48 object-cover" 
                        loading="lazy"
                        decoding="async"
                    />
                    <div className="p-6">
                      <span className="text-xs font-semibold uppercase tracking-wider bg-pink-100 text-pink-700 px-2 py-1 rounded-full">{article.tag}</span>
                      <h3 className="text-xl font-bold text-stone-800 mt-3 mb-2">{article.title}</h3>
                      <p className="text-stone-600 text-sm mb-4 leading-relaxed">{article.description}</p>
                      <a href="#" className="font-bold text-pink-500 hover:text-pink-600 transition-colors duration-200 group-hover:underline">
                        Leia mais...
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

             {/* Clinic Interior */}
            <Section id="local" className="bg-stone-50">
                <SectionTitle subtitle="Nosso Espaço" title="Um Ambiente Acolhedor" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {clinicImages.map((src, index) => <img key={index} src={src} alt={`Clínica ${index+1}`} className="rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 aspect-square object-cover" loading="lazy" decoding="async" />)}
                </div>
            </Section>
            
            {/* Professionals */}
             <Section id="profissionais">
                 <SectionTitle subtitle="A Especialista" title="Conheça Tainá Batista" />
                <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl p-8 text-center">
                    <UserIcon className="w-24 h-24 mx-auto text-pink-300 mb-4" />
                    <h3 className="text-3xl font-bold text-stone-800">{professionals[0].name}</h3>
                    <p className="text-pink-500 font-medium mt-1">{professionals[0].role}</p>
                </div>
             </Section>
             
             {/* Testimonials */}
             <Section id="avaliacoes" className="bg-stone-50">
                <SectionTitle subtitle="O que dizem" title="Nossas Clientes" />
                <div className="grid md:grid-cols-3 gap-8">
                {testimonials.map((t, i) => (
                    <div key={i} className="bg-white p-6 rounded-lg border border-stone-200 shadow-sm">
                        <div className="flex items-center mb-4">
                            {t.platform === 'Google' ? <GoogleIcon className="w-6 h-6 text-red-500" /> : <InstagramIcon className="w-6 h-6 text-pink-600" />}
                            <span className="font-bold ml-2 text-stone-800">{t.user}</span>
                        </div>
                        <div className="flex mb-2">
                           {[...Array(t.rating)].map((_, j) => <StarIcon key={j} className="text-yellow-400" />)}
                        </div>
                        <p className="text-stone-600">"{t.text}"</p>
                    </div>
                ))}
                </div>
            </Section>
            
            {/* Contact */}
            <Section id="contato" className="bg-gradient-to-t from-pink-100 to-white">
                 <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-4xl sm:text-5xl font-bold text-stone-800">Pronta para sua Transformação?</h2>
                    <p className="mt-4 text-stone-600 text-lg">Seu próximo passo para a autoestima e bem-estar está a um clique de distância. Agende sua avaliação e descubra o poder de um cuidado especializado.</p>
                    <CTAButton onClick={() => setIsBookingOpen(true)} className="mt-8">Agendar Agora</CTAButton>
                </div>
            </Section>

            {/* Footer */}
            <footer className="bg-stone-800 text-white py-8">
                 <div className="container mx-auto px-6 lg:px-8 text-center text-stone-400">
                    <p>&copy; {new Date().getFullYear()} Tainá Batista Estética Auricular. Todos os direitos reservados.</p>
                 </div>
            </footer>
            
            <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-transform duration-300 hover:scale-110 z-20" aria-label="Fale Conosco no WhatsApp">
                 <WhatsAppIcon className="w-8 h-8" />
            </a>

            {/* Booking Modal */}
            {isBookingOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
                        <button onClick={() => setIsBookingOpen(false)} className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 hover:bg-stone-200 z-10">
                            <XIcon className="w-6 h-6 text-stone-600" />
                        </button>
                        <BookingFlow onClose={() => setIsBookingOpen(false)} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientView;
