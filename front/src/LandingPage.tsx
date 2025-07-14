import { useState } from "react";

// Modern Icons optimized for 2025
const Icons = {
  Shield: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  ),
  Lightning: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  ),
  Chip: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
      />
    </svg>
  ),
  Globe: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
      />
    </svg>
  ),
  // Electronics-specific icons
  Smartphone: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z"
      />
    </svg>
  ),
  Laptop: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  ),
  Headphones: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.536 12.464a5 5 0 010-7.072m2.828 2.829a9 9 0 010 12.728M8.464 12.464a5 5 0 000-7.072m-2.828 2.829a9 9 0 000 12.728M12 18a6 6 0 006-6V9a6 6 0 00-12 0v3a6 6 0 006 6z"
      />
    </svg>
  ),
  Camera: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  Gaming: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  ),
  Watch: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  Star: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ),
  ArrowRight: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 8l4 4m0 0l-4 4m4-4H3"
      />
    </svg>
  ),
  Menu: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  ),
  X: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  ),
};

// Hero section with modern design
const HeroSection = ({ onGetStarted }: { onGetStarted: () => void }) => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
    {/* Animated background gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950"></div>

    {/* Animated mesh gradient overlay */}
    <div className="absolute inset-0 opacity-30">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
    </div>

    {/* Content */}
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <div className="space-y-8 fade-in">
        {/* Main headline */}
        <div className="space-y-6">
          <h2 className="text-6xl md:text-8xl lg:text-9xl font-bold leading-tight tracking-tight premium-title">
            TechStore
          </h2>
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Descubre la mejor selección de smartphones, laptops, gaming, audio y
            tecnología de última generación. Tu destino premium para toda la
            tecnología que necesitas.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
          <button
            onClick={onGetStarted}
            className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-violet-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-2xl transform hover:-translate-y-1"
          >
            Comenzar Ahora
            <Icons.ArrowRight />
          </button>
          <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300">
            Ver Demo
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16 pt-8 border-t border-white/10">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">5000+</div>
            <div className="text-slate-400 text-sm">Productos Tech</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">100+</div>
            <div className="text-slate-400 text-sm">Marcas Premium</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">24h</div>
            <div className="text-slate-400 text-sm">Envío Express</div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Features section with modern cards
const FeaturesSection = () => (
  <section className="py-24 bg-slate-950/50 backdrop-blur-xl">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h3 className="text-4xl font-bold text-white mb-4">
          La Mejor Tecnología a tu Alcance
        </h3>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Descubre la última tecnología en smartphones, laptops, gaming y más
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          {
            icon: <Icons.Smartphone />,
            title: "Smartphones Última Generación",
            description:
              "Los últimos modelos de iPhone, Samsung, Google Pixel y más marcas premium",
          },
          {
            icon: <Icons.Laptop />,
            title: "Laptops & Computadoras",
            description:
              "Gaming, trabajo y estudio. MacBooks, Dell, HP, Lenovo y más con garantía extendida",
          },
          {
            icon: <Icons.Gaming />,
            title: "Gaming & Entretenimiento",
            description:
              "Consolas, PC Gaming, VR y accesorios para la mejor experiencia de juego",
          },
          {
            icon: <Icons.Headphones />,
            title: "Audio Premium",
            description:
              "Auriculares, speakers y sistemas de audio de las mejores marcas del mundo",
          },
          {
            icon: <Icons.Camera />,
            title: "Fotografía & Video",
            description:
              "Cámaras DSLR, mirrorless, drones y equipos profesionales de fotografía",
          },
          {
            icon: <Icons.Watch />,
            title: "Wearables & Smart Tech",
            description:
              "Apple Watch, fitness trackers, smart home y dispositivos inteligentes",
          },
        ].map((feature, index) => (
          <div
            key={index}
            className="group bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:-translate-y-2"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-violet-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              {feature.icon}
            </div>
            <h4 className="text-xl font-semibold text-white mb-2">
              {feature.title}
            </h4>
            <p className="text-slate-400">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Testimonials section
const TestimonialsSection = () => (
  <section className="py-24 bg-gradient-to-r from-blue-950/50 to-violet-950/50 backdrop-blur-xl">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h3 className="text-4xl font-bold text-white mb-4">
          Confiado por Líderes de la Industria
        </h3>
        <p className="text-xl text-slate-400">
          Ve lo que dicen nuestros clientes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          {
            name: "Sarah Chen",
            role: "CTO, TechCorp",
            avatar: "SC",
            rating: 5,
            text: "TechStore transformó nuestras operaciones de e-commerce. La arquitectura multi-tenant nos ahorró millones en costos de infraestructura.",
          },
          {
            name: "Marcus Rodriguez",
            role: "VP Ingeniería, StartupXYZ",
            avatar: "MR",
            rating: 5,
            text: "La sincronización de inventario en tiempo real en nuestras tiendas globales es revolucionaria. No más sobreventa o desabastecimiento.",
          },
          {
            name: "Emily Watson",
            role: "Jefa de Digital, RetailGiant",
            avatar: "EW",
            rating: 5,
            text: "Rendimiento súper rápido y seguridad empresarial. Nuestras tasas de conversión aumentaron un 40% después de la migración.",
          },
        ].map((testimonial, index) => (
          <div
            key={index}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300"
          >
            <div className="flex items-center gap-2 mb-4">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Icons.Star key={i} />
              ))}
            </div>
            <p className="text-slate-300 mb-4 italic">"{testimonial.text}"</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-violet-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {testimonial.avatar}
              </div>
              <div>
                <div className="text-white font-medium">{testimonial.name}</div>
                <div className="text-slate-400 text-sm">{testimonial.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Modern navigation
const Navigation = ({ onGetStarted }: { onGetStarted: () => void }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-violet-600 rounded-lg flex items-center justify-center">
              <Icons.Lightning />
            </div>
            <span className="text-xl font-bold text-white">TechStore</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-slate-300 hover:text-white transition-colors"
            >
              Características
            </a>
            <a
              href="#pricing"
              className="text-slate-300 hover:text-white transition-colors"
            >
              Precios
            </a>
            <a
              href="#about"
              className="text-slate-300 hover:text-white transition-colors"
            >
              Acerca de
            </a>
            <a
              href="#contact"
              className="text-slate-300 hover:text-white transition-colors"
            >
              Contacto
            </a>
            <button
              onClick={onGetStarted}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-violet-700 transition-all duration-200"
            >
              Comenzar
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <Icons.X /> : <Icons.Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/50 backdrop-blur-xl rounded-2xl mt-2 p-4 border border-white/10">
            <div className="space-y-4">
              <a
                href="#features"
                className="block text-slate-300 hover:text-white transition-colors"
              >
                Características
              </a>
              <a
                href="#pricing"
                className="block text-slate-300 hover:text-white transition-colors"
              >
                Precios
              </a>
              <a
                href="#about"
                className="block text-slate-300 hover:text-white transition-colors"
              >
                Acerca de
              </a>
              <a
                href="#contact"
                className="block text-slate-300 hover:text-white transition-colors"
              >
                Contacto
              </a>
              <button
                onClick={onGetStarted}
                className="w-full px-6 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-violet-700 transition-all duration-200"
              >
                Comenzar
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Footer
const Footer = () => (
  <footer className="bg-black/50 backdrop-blur-xl border-t border-white/10 py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-violet-600 rounded-lg flex items-center justify-center">
              <Icons.Lightning />
            </div>
            <span className="text-xl font-bold text-white">TechStore</span>
          </div>
          <p className="text-slate-400">
            Plataforma de e-commerce de próxima generación para la empresa
            moderna.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Producto</h4>
          <div className="space-y-2">
            <a
              href="#"
              className="block text-slate-400 hover:text-white transition-colors"
            >
              Características
            </a>
            <a
              href="#"
              className="block text-slate-400 hover:text-white transition-colors"
            >
              Precios
            </a>
            <a
              href="#"
              className="block text-slate-400 hover:text-white transition-colors"
            >
              API
            </a>
            <a
              href="#"
              className="block text-slate-400 hover:text-white transition-colors"
            >
              Documentación
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Empresa</h4>
          <div className="space-y-2">
            <a
              href="#"
              className="block text-slate-400 hover:text-white transition-colors"
            >
              Acerca de
            </a>
            <a
              href="#"
              className="block text-slate-400 hover:text-white transition-colors"
            >
              Blog
            </a>
            <a
              href="#"
              className="block text-slate-400 hover:text-white transition-colors"
            >
              Carreras
            </a>
            <a
              href="#"
              className="block text-slate-400 hover:text-white transition-colors"
            >
              Contacto
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Soporte</h4>
          <div className="space-y-2">
            <a
              href="#"
              className="block text-slate-400 hover:text-white transition-colors"
            >
              Centro de Ayuda
            </a>
            <a
              href="#"
              className="block text-slate-400 hover:text-white transition-colors"
            >
              Comunidad
            </a>
            <a
              href="#"
              className="block text-slate-400 hover:text-white transition-colors"
            >
              Estado
            </a>
            <a
              href="#"
              className="block text-slate-400 hover:text-white transition-colors"
            >
              Seguridad
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 mt-8 pt-8 text-center text-slate-400">
        <p>
          &copy; 2025 TechStore. Todos los derechos reservados. Construido con
          Tailwind CSS 4.1
        </p>
      </div>
    </div>
  </footer>
);

// Main Landing Page Component
const LandingPage = ({ onNavigateToApp }: { onNavigateToApp: () => void }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      <Navigation onGetStarted={onNavigateToApp} />
      <HeroSection onGetStarted={onNavigateToApp} />
      <FeaturesSection />
      <TestimonialsSection />
      <Footer />
    </div>
  );
};

export default LandingPage;
