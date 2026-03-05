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
  Leaf,
  Globe,
  Smartphone,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  QrCode
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import heroImage from "@/assets/hero-coffee-angola.jpg";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const features = [
    {
      icon: Coffee,
      title: "Rastreabilidade Completa",
      description: "Acompanhe cada etapa do percurso do café - da colheita à exportação com registos imutáveis.",
      badge: "Core"
    },
    {
      icon: Shield,
      title: "Certificação & EUDR",
      description: "Conformidade garantida com EUDR, UTZ, Rainforest Alliance, Fair Trade e DOC Angola.",
      badge: "Compliance"
    },
    {
      icon: ClipboardCheck,
      title: "Fiscalização INCA",
      description: "Visitas técnicas, ações de controlo, e monitorização de conformidade em tempo real.",
      badge: "Novo"
    },
    {
      icon: Activity,
      title: "Sensores IoT",
      description: "Monitorização de temperatura, humidade e condições ambientais com alertas automáticos.",
      badge: "Novo"
    },
    {
      icon: BarChart3,
      title: "Sistema de Informação de Mercado",
      description: "Preços actualizados, tendências de mercado e análises para tomada de decisão.",
      badge: "SIM"
    },
    {
      icon: Bell,
      title: "Notificações Inteligentes",
      description: "Alertas automáticos para prazos, não-conformidades e actualizações críticas.",
      badge: "Novo"
    },
    {
      icon: MapPin,
      title: "Geolocalização Avançada",
      description: "Mapeamento interactivo de explorações, parcelas e rotas logísticas.",
      badge: "GIS"
    },
    {
      icon: Users,
      title: "Multi-Perfil & Permissões",
      description: "Acesso personalizado para produtores, técnicos, cooperativas e exportadores.",
      badge: "RBAC"
    },
    {
      icon: QrCode,
      title: "Verificação Pública",
      description: "Consumidores podem verificar origem, qualidade e certificações via QR code.",
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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section ref={heroRef} className="relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8 min-h-[600px]">
        {/* Background Image with Parallax */}
        <motion.div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
          style={{ 
            backgroundImage: `url(${heroImage})`,
            y: backgroundY
          }}
        />
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/50" />
        <motion.div 
          className="relative max-w-7xl mx-auto"
          style={{ y: textY, opacity }}
        >
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div 
              className="flex-1 text-center lg:text-left"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Badge variant="secondary" className="mb-4 text-sm px-4 py-1">
                Sistema Nacional de Rastreabilidade
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
                INCA Coffee Trace
              </h1>
              <p className="text-xl sm:text-2xl text-primary-foreground/90 mb-4 font-medium">
                Qualidade & Rastreabilidade do Café Angolano
              </p>
              <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl">
                Plataforma integrada de gestão da cadeia de valor do café - da produção à exportação.
                Conformidade EUDR, certificações internacionais e transparência total.
              </p>
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Button size="lg" variant="secondary" className="text-lg px-8 gap-2" onClick={() => window.location.href = "/verificar"}>
                  <QrCode className="h-5 w-5" />
                  Verificar Lote
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 gap-2" onClick={() => window.location.href = "/sim-publico"}>
                  <BarChart3 className="h-5 w-5" />
                  Dados de Mercado
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 gap-2" onClick={() => window.location.href = "/boletim-mercado"}>
                  <TrendingUp className="h-5 w-5" />
                  Boletim Mensal
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 gap-2" onClick={() => window.location.href = "/auth"}>
                  Acesso ao Sistema
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </motion.div>
            </motion.div>
            <motion.div 
              className="flex-1 hidden lg:flex justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            >
              <div className="relative">
                <div className="w-72 h-72 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                  <Coffee className="w-32 h-32 text-primary-foreground" />
                </div>
                <motion.div 
                  className="absolute -top-4 -right-4 bg-secondary text-secondary-foreground rounded-full p-3 shadow-lg"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.5, type: "spring" }}
                >
                  <CheckCircle2 className="w-8 h-8" />
                </motion.div>
                <motion.div 
                  className="absolute -bottom-4 -left-4 bg-accent text-accent-foreground rounded-full p-3 shadow-lg"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.6, type: "spring" }}
                >
                  <Activity className="w-8 h-8" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card border-b">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
            {[
              { value: "18", label: "Províncias Cobertas" },
              { value: "5.000+", label: "Produtores Registados" },
              { value: "15k+", label: "Hectares Mapeados" },
              { value: "100%", label: "Rastreabilidade" },
            ].map((stat, index) => (
              <motion.div 
                key={index}
                className="p-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground text-sm">{stat.label}</div>
              </motion.div>
            ))}
            <motion.div 
              className="p-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center justify-center gap-1 text-secondary mb-2">
                <TrendingUp className="w-6 h-6" />
                <span className="text-4xl font-bold">EUDR</span>
              </div>
              <div className="text-muted-foreground text-sm">Conformidade UE</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Funcionalidades</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Plataforma Completa de Gestão
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Sistema integrado para garantir qualidade, rastreabilidade e conformidade do café angolano
              nos mercados nacional e internacional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
                className="cursor-pointer"
              >
                <Card className="group border-border hover:border-primary hover:shadow-xl transition-all duration-300 h-full overflow-hidden relative">
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <motion.div 
                        className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:shadow-lg transition-all duration-300"
                        whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <feature.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                      </motion.div>
                      <Badge 
                        variant={feature.badge === "Novo" ? "default" : "outline"} 
                        className={`${feature.badge === "Novo" ? "bg-secondary text-secondary-foreground" : ""} group-hover:scale-105 transition-transform duration-300`}
                      >
                        {feature.badge}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                      {feature.description}
                    </p>
                    {/* Arrow indicator */}
                    <div className="mt-4 flex items-center text-primary opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                      <span className="text-sm font-medium">Saber mais</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Módulos</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Arquitectura Modular
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Cada módulo foi desenhado para responder às necessidades específicas
              dos diferentes intervenientes na cadeia de valor do café.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((module, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                      <module.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {module.items.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4">Tecnologia</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Inovação ao Serviço da Qualidade
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Activity className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Sensores IoT</h3>
                    <p className="text-muted-foreground text-sm">
                      Monitorização contínua de temperatura, humidade e condições de armazenamento
                      com alertas automáticos para desvios.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Bell className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Notificações Inteligentes</h3>
                    <p className="text-muted-foreground text-sm">
                      Sistema automatizado de alertas para prazos de ações, visitas técnicas
                      e não-conformidades detectadas.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Smartphone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Acesso Mobile</h3>
                    <p className="text-muted-foreground text-sm">
                      Interface responsiva optimizada para trabalho de campo,
                      com suporte a captura de fotos e leitura de QR codes.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Mapeamento GIS</h3>
                    <p className="text-muted-foreground text-sm">
                      Visualização geográfica interactiva de explorações, parcelas,
                      rotas logísticas e pontos de controlo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="col-span-2">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Taxa de Conformidade</p>
                        <p className="text-2xl font-bold text-secondary">94.7%</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">Sensores Activos</p>
                      <p className="text-xl font-bold text-primary">127</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">Lotes Rastreados</p>
                      <p className="text-xl font-bold text-primary">3.2k</p>
                    </CardContent>
                  </Card>
                  <Card className="col-span-2">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Exportações EUDR-Ready</p>
                        <p className="text-lg font-bold">100% Conformes</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-hero">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-6">
            Junte-se à Revolução Digital do Café Angolano
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8">
            Registe-se no sistema INCA Coffee Trace e garanta a rastreabilidade,
            qualidade e conformidade do seu café para os mercados mais exigentes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 gap-2" onClick={() => window.location.href = "/auth"}>
              Criar Conta
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10" onClick={() => window.location.href = "/sim-publico"}>
              Explorar Mercado
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 gap-2" onClick={() => window.location.href = "/boletim-mercado"}>
              <TrendingUp className="h-5 w-5" />
              Boletim Mensal
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Coffee className="w-8 h-8" />
                <span className="text-xl font-bold">INCA Coffee Trace</span>
              </div>
              <p className="text-primary-foreground/80 text-sm">
                Sistema Nacional de Rastreabilidade e Qualidade do Café de Angola.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Plataforma</h4>
              <ul className="space-y-2 text-primary-foreground/80 text-sm">
                <li><a href="/verificar" className="hover:text-primary-foreground transition-colors">Verificar Lote</a></li>
                <li><a href="/sim-publico" className="hover:text-primary-foreground transition-colors">Dados de Mercado (Público)</a></li>
                <li><a href="/boletim-mercado" className="hover:text-primary-foreground transition-colors">Boletim Mensal</a></li>
                <li><a href="/mapa" className="hover:text-primary-foreground transition-colors">Mapa de Explorações</a></li>
                <li><a href="/auth" className="hover:text-primary-foreground transition-colors">Acesso ao Sistema</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Recursos</h4>
              <ul className="space-y-2 text-primary-foreground/80 text-sm">
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Documentação</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Certificações</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Conformidade EUDR</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Suporte Técnico</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contacto</h4>
              <ul className="space-y-2 text-primary-foreground/80 text-sm">
                <li>Instituto Nacional do Café de Angola</li>
                <li>Luanda, Angola</li>
                <li>info@inca.gov.ao</li>
                <li>+244 XXX XXX XXX</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary-foreground/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-primary-foreground/60 text-sm">
            <p>&copy; 2024 INCA - Instituto Nacional do Café de Angola. Todos os direitos reservados.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-primary-foreground transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-primary-foreground transition-colors">Privacidade</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
