import { 
  Coffee, 
  MapPin, 
  Shield, 
  BarChart3, 
  Users, 
  PackageCheck,
  Activity,
  Bell,
  ClipboardCheck,
  Award,
  Leaf,
  Globe,
  Smartphone,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  QrCode,
  ChevronRight,
  Menu,
  X,
  HelpCircle
} from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence, useInView, useMotionValue, useSpring, MotionValue } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import heroImage from "@/assets/hero-coffee-angola.jpg";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const AnimatedCounter = ({ target, format, delay = 0 }: { target: number; format: (n: number) => string; delay?: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { duration: 1800, bounce: 0 });

  useEffect(() => {
    if (isInView) {
      const timeout = setTimeout(() => motionVal.set(target), delay * 1000);
      return () => clearTimeout(timeout);
    }
  }, [isInView, target, delay, motionVal]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (v) => {
      if (ref.current) ref.current.textContent = format(v);
    });
    return unsubscribe;
  }, [spring, format]);

  return <span ref={ref}>0</span>;
};

const Index = () => {
  const heroRef = useRef<HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const navLinks = [
    { href: "#funcionalidades", label: "Funcionalidades" },
    { href: "#modulos", label: "Módulos" },
    { href: "#tecnologia", label: "Tecnologia" },
    { href: "/verificar", label: "Verificar Lote" },
  ];

  const features = [
    {
      icon: Coffee,
      title: "Rastreabilidade Completa",
      description: "Cada etapa do percurso do café — da colheita à exportação — com registos imutáveis.",
      badge: "Core"
    },
    {
      icon: Shield,
      title: "Certificação & EUDR",
      description: "Conformidade garantida com EUDR, UTZ, Rainforest Alliance e Fair Trade.",
      badge: "Compliance"
    },
    {
      icon: ClipboardCheck,
      title: "Fiscalização INCA",
      description: "Visitas técnicas, ações de controlo e monitorização de conformidade em tempo real.",
      badge: "Novo"
    },
    {
      icon: Activity,
      title: "Sensores IoT",
      description: "Temperatura, humidade e condições ambientais com alertas automáticos.",
      badge: "IoT"
    },
    {
      icon: BarChart3,
      title: "Inteligência de Mercado",
      description: "Preços actualizados, tendências e análises para tomada de decisão.",
      badge: "SIM"
    },
    {
      icon: QrCode,
      title: "Verificação Pública",
      description: "Consumidores verificam origem, qualidade e certificações via QR code.",
      badge: "Transparência"
    }
  ];

  const modules = [
    {
      icon: Leaf,
      title: "Gestão de Explorações",
      items: ["Registo de explorações e parcelas", "Manutenção agrícola", "Colheitas e campanhas", "Validação técnica"]
    },
    {
      icon: PackageCheck,
      title: "Gestão de Lotes",
      items: ["Rastreabilidade por QR/RFID", "Secagem e processamento", "Análises de qualidade", "Certificação SCA"]
    },
    {
      icon: ClipboardCheck,
      title: "Fiscalização INCA",
      items: ["Visitas técnicas programadas", "Ações de controlo", "Relatórios de conformidade", "Alertas de prazos"]
    },
    {
      icon: Globe,
      title: "Exportação & EUDR",
      items: ["Gestão de embarques", "Documentação aduaneira", "Pacotes EUDR", "Certificados de origem"]
    }
  ];

  const stats = [
    { value: 18, label: "Províncias", suffix: "", format: (n: number) => Math.round(n).toString() },
    { value: 5000, label: "Produtores", suffix: "+", format: (n: number) => Math.round(n).toLocaleString("pt-AO") },
    { value: 15000, label: "Hectares", suffix: "+", format: (n: number) => `${Math.round(n / 1000)}k` },
    { value: 100, label: "Rastreabilidade", suffix: "%", format: (n: number) => Math.round(n).toString() },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="absolute top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-3 sm:py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <Coffee className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-base sm:text-lg font-bold text-white tracking-tight">INCA Coffee Trace</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-white/80">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-white transition-colors">{link.label}</a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              className="hidden sm:inline-flex bg-white/15 backdrop-blur-sm text-white border border-white/25 hover:bg-white/25 rounded-xl"
              onClick={() => window.location.href = "/auth"}
            >
              Acesso ao Sistema
            </Button>
            <button
              className="md:hidden p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white active:bg-white/20 touch-manipulation"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Full screen overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="md:hidden mt-3 bg-black/70 backdrop-blur-2xl rounded-2xl border border-white/15 p-5 space-y-1"
            >
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between px-4 py-3.5 text-base text-white/85 hover:text-white active:bg-white/10 rounded-xl transition-colors touch-manipulation"
                >
                  {link.label}
                  <ChevronRight className="w-4 h-4 text-white/40" />
                </motion.a>
              ))}
              <div className="pt-3 mt-2 border-t border-white/10">
                <a
                  href="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3.5 text-base font-semibold text-accent bg-accent/10 rounded-xl active:bg-accent/20 transition-colors touch-manipulation"
                >
                  Acesso ao Sistema
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative overflow-hidden min-h-[85vh] sm:min-h-[92vh] flex items-center">
        {/* Background Image with Parallax */}
        <motion.div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
          style={{ 
            backgroundImage: `url(${heroImage})`,
            y: backgroundY
          }}
        />
        {/* Darker, more cinematic overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
        
        <motion.div 
          className="relative w-full px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24"
          style={{ y: textY, opacity }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <Badge className="mb-4 sm:mb-6 text-[10px] sm:text-xs px-3 py-1 bg-white/15 backdrop-blur-sm text-white border-white/25 rounded-full uppercase tracking-widest font-medium">
                  Sistema Nacional de Rastreabilidade
                </Badge>
                <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold text-white mb-4 sm:mb-5 leading-[1.1] sm:leading-[1.05] tracking-tight">
                  Qualidade &<br />
                  <span className="text-accent">Rastreabilidade</span><br />
                  do Café Angolano
                </h1>
                <p className="text-base sm:text-xl text-white/75 mb-7 sm:mb-10 max-w-xl leading-relaxed">
                  Da produção à exportação — conformidade EUDR, certificações internacionais e transparência total numa única plataforma.
                </p>
              </motion.div>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Button 
                  size="lg" 
                  className="bg-accent text-accent-foreground hover:bg-accent/90 text-sm sm:text-base px-6 sm:px-7 h-12 sm:h-11 rounded-xl gap-2 shadow-lg shadow-accent/25 touch-manipulation"
                  onClick={() => window.location.href = "/verificar"}
                >
                  <QrCode className="h-5 w-5" />
                  Verificar Lote
                </Button>
                <Button 
                  size="lg" 
                  className="bg-white/10 backdrop-blur-sm text-white border border-white/25 hover:bg-white/20 text-sm sm:text-base px-6 sm:px-7 h-12 sm:h-11 rounded-xl gap-2 touch-manipulation"
                  onClick={() => window.location.href = "/sim-publico"}
                >
                  <BarChart3 className="h-5 w-5" />
                  Dados de Mercado
                </Button>
              </motion.div>
            </div>

            {/* Floating Stats on Hero */}
            <motion.div 
              className="mt-8 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 max-w-2xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
            {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  className="bg-white/10 backdrop-blur-md rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 border border-white/15 cursor-default"
                  whileHover={{
                    scale: 1.08,
                    boxShadow: "0 0 24px 4px hsla(var(--accent) / 0.35)",
                    borderColor: "hsla(var(--accent) / 0.5)",
                    backgroundColor: "rgba(255,255,255,0.18)",
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 20 }}
                >
                  <div className="text-xl sm:text-3xl font-bold text-white">
                    <AnimatedCounter target={stat.value} format={stat.format} delay={i * 0.15} /><span className="text-accent">{stat.suffix}</span>
                  </div>
                  <div className="text-[10px] sm:text-xs text-white/60 mt-0.5">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="funcionalidades" className="py-14 sm:py-24 px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-10 sm:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Funcionalidades</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Plataforma Completa de Gestão
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Sistema integrado para garantir qualidade, rastreabilidade e conformidade do café angolano.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } },
            }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 40, scale: 0.95 },
                  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
                }}
                whileHover={{ y: -6 }}
                className="cursor-pointer"
              >
                <Card className="group border-border/60 hover:border-primary/40 hover:shadow-medium transition-all duration-300 h-full bg-card">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:shadow-lg transition-all duration-300">
                        <feature.icon className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                      </div>
                      <Badge 
                        variant={feature.badge === "Novo" ? "default" : "outline"} 
                        className={`text-[10px] ${feature.badge === "Novo" ? "bg-secondary text-secondary-foreground" : ""}`}
                      >
                        {feature.badge}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1.5 group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="modulos" className="py-14 sm:py-24 px-4 sm:px-6 lg:px-8 bg-muted/40 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-12 items-start">
            <motion.div 
              className="lg:col-span-2 lg:sticky lg:top-24"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Módulos</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Arquitectura Modular
              </h2>
              <p className="text-muted-foreground mb-6">
                Cada módulo responde às necessidades específicas dos diferentes intervenientes na cadeia de valor do café.
              </p>
              <Button variant="outline" className="gap-2 rounded-xl" onClick={() => window.location.href = "/auth"}>
                Explorar Módulos
                <ChevronRight className="w-4 h-4" />
              </Button>
            </motion.div>
            
            <motion.div
              className="lg:col-span-3 grid sm:grid-cols-2 gap-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.15 } },
              }}
            >
              {modules.map((module, index) => (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 40, scale: 0.95 },
                    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
                  }}
                  whileHover={{ y: -6 }}
                  className="cursor-pointer"
                >
                  <Card className="h-full border-border/60 hover:border-primary/40 hover:shadow-medium transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                        <module.icon className="w-5 h-5 text-primary" />
                      </div>
                      <CardTitle className="text-base">{module.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="space-y-1.5">
                        {module.items.map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="w-3.5 h-3.5 text-secondary shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Technology / Dashboard Preview */}
      <section id="tecnologia" className="py-14 sm:py-24 px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Tecnologia</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Inovação ao Serviço<br />da Qualidade
              </h2>
              <div className="space-y-5">
                {[
                  { icon: Activity, title: "Sensores IoT", desc: "Monitorização contínua de temperatura, humidade e condições de armazenamento com alertas automáticos." },
                  { icon: Bell, title: "Notificações Inteligentes", desc: "Alertas automatizados para prazos, visitas técnicas e não-conformidades detectadas." },
                  { icon: Smartphone, title: "Acesso Mobile", desc: "Interface responsiva para trabalho de campo com captura de fotos e leitura de QR codes." },
                  { icon: MapPin, title: "Mapeamento GIS", desc: "Visualização geográfica de explorações, parcelas, rotas logísticas e pontos de controlo." },
                ].map((item, i) => (
                  <motion.div 
                    key={i} 
                    className="flex gap-4"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-0.5 text-sm">{item.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Animated Tech Stats */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 94.7, label: "Taxa de Conformidade", suffix: "%", format: (n: number) => n.toFixed(1), icon: CheckCircle2, color: "text-secondary", bgColor: "bg-secondary/15" },
                  { value: 127, label: "Sensores Activos", suffix: "", format: (n: number) => Math.round(n).toString(), icon: Activity, color: "text-primary", bgColor: "bg-primary/10" },
                  { value: 3200, label: "Lotes Rastreados", suffix: "", format: (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : Math.round(n).toString(), icon: PackageCheck, color: "text-primary", bgColor: "bg-primary/10" },
                  { value: 100, label: "EUDR Conformes", suffix: "%", format: (n: number) => Math.round(n).toString(), icon: Globe, color: "text-accent", bgColor: "bg-accent/15" },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                    whileHover={{ y: -4, boxShadow: "var(--shadow-medium)" }}
                  >
                    <Card className="border-border/60 hover:border-primary/30 transition-all duration-300">
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center gap-2.5 mb-2.5">
                          <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                            <stat.icon className={`w-4 h-4 ${stat.color}`} />
                          </div>
                        </div>
                        <p className={`text-2xl sm:text-3xl font-bold ${stat.color}`}>
                          <AnimatedCounter target={stat.value} format={stat.format} delay={0.4 + i * 0.15} />
                          <span>{stat.suffix}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline - História do Café Angolano */}
      <section className="py-14 sm:py-24 px-4 sm:px-6 lg:px-8 scroll-mt-20 overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-10 sm:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">História</p>
            <h2 className="text-2xl sm:text-4xl font-bold text-foreground mb-4">
              O Percurso do Café Angolano
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
              De uma tradição secular à era digital — marcos que definiram a identidade cafeeira de Angola.
            </p>
          </motion.div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-border sm:-translate-x-px" />

            {[
              { year: "1830", title: "Primeiras Plantações", desc: "Início do cultivo do café em Angola, trazido pelos colonizadores portugueses às terras férteis do planalto central.", side: "left" },
              { year: "1960", title: "4.º Maior Produtor Mundial", desc: "Angola atinge o pico de produção com mais de 200 mil toneladas anuais, tornando-se referência global em café Robusta.", side: "right" },
              { year: "1975", title: "Independência e Transição", desc: "Com a independência, o sector cafeeiro enfrenta desafios estruturais. A produção diminui significativamente nas décadas seguintes.", side: "left" },
              { year: "2000", title: "Início da Recuperação", desc: "Programas de revitalização do sector começam a reconstruir a cadeia produtiva com apoio institucional e cooperação internacional.", side: "right" },
              { year: "2015", title: "Criação do INCA", desc: "O Instituto Nacional do Café é reforçado para liderar a modernização, certificação e promoção do café angolano nos mercados internacionais.", side: "left" },
              { year: "2024", title: "Era Digital & EUDR", desc: "Lançamento do sistema de rastreabilidade digital, garantindo conformidade com o Regulamento Europeu e acesso a mercados premium.", side: "right" },
            ].map((item, i) => (
              <motion.div
                key={i}
                className={`relative flex items-start gap-4 sm:gap-0 mb-8 sm:mb-12 last:mb-0 ${
                  item.side === "right" ? "sm:flex-row-reverse" : ""
                }`}
                initial={{ opacity: 0, x: item.side === "left" ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                {/* Dot */}
                <div className="absolute left-4 sm:left-1/2 w-3 h-3 rounded-full bg-primary border-2 border-background -translate-x-1.5 sm:-translate-x-1.5 mt-1.5 z-10 shadow-sm" />

                {/* Content */}
                <div className={`ml-10 sm:ml-0 sm:w-[calc(50%-2rem)] ${item.side === "right" ? "sm:mr-auto sm:pr-0 sm:pl-0" : "sm:ml-auto sm:pl-0 sm:pr-0"}`}>
                  <Card className="border-border/60 hover:border-primary/30 hover:shadow-soft transition-all duration-300">
                    <CardContent className="p-4 sm:p-5">
                      <Badge variant="outline" className="mb-2 text-xs font-bold text-primary border-primary/30">
                        {item.year}
                      </Badge>
                      <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {item.desc}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-14 sm:py-24 px-4 sm:px-6 lg:px-8 bg-muted/40 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Testemunhos</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Vozes do Café Angolano
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Produtores, cooperativas e exportadores partilham as suas experiências com a plataforma.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Maria João Sebastião",
                role: "Produtora · Kwanza Sul",
                quote: "Desde que comecei a usar o sistema, consigo registar cada etapa da minha produção. Os compradores europeus confiam mais no meu café porque podem verificar tudo pelo QR code.",
                initials: "MJ",
              },
              {
                name: "António Domingos",
                role: "Cooperativa Café do Planalto · Huambo",
                quote: "A rastreabilidade deu-nos acesso a mercados premium. O preço do nosso café subiu 30% porque agora temos certificação e dados de qualidade comprovados.",
                initials: "AD",
              },
              {
                name: "Francisca Lopes",
                role: "Exportadora · Luanda",
                quote: "A conformidade EUDR era o nosso maior desafio. Com a plataforma, geramos os pacotes de due diligence em minutos — antes levava semanas.",
                initials: "FL",
              },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Card className="h-full border-border/60 hover:shadow-medium transition-shadow duration-300">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="mb-4 flex gap-1">
                      {[...Array(5)].map((_, s) => (
                        <svg key={s} className="w-4 h-4 text-accent fill-accent" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <blockquote className="text-sm text-muted-foreground leading-relaxed flex-1 italic">
                      "{testimonial.quote}"
                    </blockquote>
                    <div className="flex items-center gap-3 mt-5 pt-4 border-t border-border/60">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {testimonial.initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners & Certifications Section */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-border/40">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Parceiros & Certificações</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Reconhecido Internacionalmente
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Trabalhamos com as principais instituições e normas internacionais para garantir a excelência do café angolano.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08 } },
            }}
          >
            {[
              { name: "EUDR", subtitle: "EU Deforestation Regulation", icon: Shield },
              { name: "ISO 22000", subtitle: "Segurança Alimentar", icon: Award },
              { name: "Rainforest Alliance", subtitle: "Certificação Sustentável", icon: Leaf },
              { name: "UTZ Certified", subtitle: "Agricultura Responsável", icon: CheckCircle2 },
              { name: "INCA", subtitle: "Instituto Nacional do Café", icon: Coffee },
              { name: "ICO", subtitle: "International Coffee Org.", icon: Globe },
            ].map((partner, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.9 },
                  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
                }}
                whileHover={{ y: -4, scale: 1.05 }}
                className="cursor-default"
              >
                <Card className="h-full border-border/60 hover:border-primary/30 hover:shadow-soft transition-all duration-300">
                  <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center">
                      <partner.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{partner.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{partner.subtitle}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-14 sm:py-24 px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="text-center mb-10 sm:mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-2xl sm:text-4xl font-bold text-foreground mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
              Respostas às dúvidas mais comuns sobre a plataforma de rastreabilidade do café angolano.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Accordion type="single" collapsible className="space-y-3">
              {[
                {
                  q: "O que é o INCA Coffee Trace?",
                  a: "É o Sistema Nacional de Rastreabilidade e Qualidade do Café de Angola, desenvolvido pelo Instituto Nacional do Café (INCA). Permite registar e acompanhar todo o percurso do café — desde a exploração agrícola até à exportação — garantindo transparência, qualidade e conformidade com normas internacionais."
                },
                {
                  q: "Como funciona a conformidade com o EUDR?",
                  a: "A plataforma gera automaticamente os pacotes de due diligence exigidos pelo Regulamento Europeu contra a Desflorestação (EUDR). Através do mapeamento georreferenciado das parcelas, registos de colheita e cadeia de custódia, os exportadores podem comprovar que o café não provém de áreas desmatadas após dezembro de 2020."
                },
                {
                  q: "Quem pode utilizar a plataforma?",
                  a: "A plataforma é destinada a todos os intervenientes da cadeia de valor do café angolano: produtores, cooperativas, processadores, transportadores, exportadores e técnicos do INCA. Cada perfil tem acesso às funcionalidades específicas ao seu papel na cadeia."
                },
                {
                  q: "Como posso verificar a origem de um lote de café?",
                  a: "Basta digitalizar o QR code presente na embalagem do café ou inserir a referência do lote na página de verificação pública. O sistema apresenta toda a informação de rastreabilidade — origem, processo, análises de qualidade e certificações — sem necessitar de conta na plataforma."
                },
                {
                  q: "A plataforma funciona offline no campo?",
                  a: "A interface é responsiva e optimizada para dispositivos móveis, permitindo captura de fotos, leitura de QR codes e registo de dados em campo. Os dados são sincronizados automaticamente quando a ligação à internet é restabelecida."
                },
                {
                  q: "Que certificações são suportadas?",
                  a: "A plataforma suporta as principais certificações internacionais: Rainforest Alliance, UTZ, Fair Trade, ISO 22000 e conformidade EUDR. Os relatórios de qualidade seguem os protocolos SCA (Specialty Coffee Association) com pontuação sensorial padronizada."
                },
              ].map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="border border-border/60 rounded-xl px-5 sm:px-6 data-[state=open]:border-primary/30 data-[state=open]:shadow-soft transition-all duration-300"
                >
                  <AccordionTrigger className="text-left text-sm sm:text-base font-semibold text-foreground hover:text-primary py-4 sm:py-5 hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_hsla(0,0%,100%,0.08)_0%,_transparent_60%)]" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl sm:text-4xl font-bold text-primary-foreground mb-4 sm:mb-5">
              Junte-se à Revolução Digital<br className="hidden sm:block" />
              do Café Angolano
            </h2>
            <p className="text-sm sm:text-base text-primary-foreground/75 mb-6 sm:mb-8 max-w-xl mx-auto">
              Registe-se e garanta a rastreabilidade, qualidade e conformidade do seu café para os mercados mais exigentes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 text-sm sm:text-base px-8 h-12 sm:h-11 rounded-xl gap-2 shadow-lg touch-manipulation"
                onClick={() => window.location.href = "/auth"}
              >
                Criar Conta
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                className="bg-white/10 text-white border border-white/25 hover:bg-white/20 text-sm sm:text-base px-8 h-12 sm:h-11 rounded-xl gap-2 touch-manipulation"
                onClick={() => window.location.href = "/sim-publico"}
              >
                Explorar Mercado
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <Coffee className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-base sm:text-lg font-bold tracking-tight">INCA Coffee Trace</span>
              </div>
              <p className="text-background/60 text-sm leading-relaxed">
                Sistema Nacional de Rastreabilidade e Qualidade do Café de Angola.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-background/80">Plataforma</h4>
              <ul className="space-y-2.5 text-background/60 text-sm">
                <li><a href="/verificar" className="hover:text-background transition-colors">Verificar Lote</a></li>
                <li><a href="/sim-publico" className="hover:text-background transition-colors">Dados de Mercado</a></li>
                <li><a href="/boletim-mercado" className="hover:text-background transition-colors">Boletim Mensal</a></li>
                <li><a href="/mapa" className="hover:text-background transition-colors">Mapa de Explorações</a></li>
                <li><a href="/auth" className="hover:text-background transition-colors">Acesso ao Sistema</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-background/80">Recursos</h4>
              <ul className="space-y-2.5 text-background/60 text-sm">
                <li><a href="#" className="hover:text-background transition-colors">Documentação</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Certificações</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Conformidade EUDR</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Suporte Técnico</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-background/80">Contacto</h4>
              <ul className="space-y-2.5 text-background/60 text-sm">
                <li>Instituto Nacional do Café de Angola</li>
                <li>Luanda, Angola</li>
                <li>info@inca.gov.ao</li>
                <li>+244 XXX XXX XXX</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-background/10 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-background/40 text-sm">
            <p>&copy; 2025 INCA — Instituto Nacional do Café de Angola</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-background/70 transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-background/70 transition-colors">Privacidade</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
