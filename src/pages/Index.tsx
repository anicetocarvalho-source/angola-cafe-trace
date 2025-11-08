import { Coffee, MapPin, Shield, BarChart3, Users, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  const features = [
    {
      icon: Coffee,
      title: "Rastreabilidade Completa",
      description: "Da plantação à chávena, acompanhe cada etapa do percurso do café angolano."
    },
    {
      icon: Shield,
      title: "Certificação & Qualidade",
      description: "Garantia de conformidade com normas EUDR, UTZ, Rainforest Alliance e DOC."
    },
    {
      icon: MapPin,
      title: "Geolocalização",
      description: "Mapeamento preciso de explorações, parcelas e pontos de controlo."
    },
    {
      icon: BarChart3,
      title: "Análise de Mercado (SIM)",
      description: "Dados em tempo real sobre preços, produção e tendências de exportação."
    },
    {
      icon: Users,
      title: "Multi-Perfil",
      description: "Acesso personalizado para produtores, cooperativas, processadores e exportadores."
    },
    {
      icon: PackageCheck,
      title: "Verificação Pública",
      description: "QR code para consumidores verificarem a origem e qualidade do seu café."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNGg3MnYxNEgzNnptMC00M2g3MnYxNEgzNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <Coffee className="w-16 h-16 text-primary-foreground" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
            Café Angola
          </h1>
          <p className="text-xl sm:text-2xl text-primary-foreground/90 mb-4 font-medium">
            Qualidade & Rastreabilidade
          </p>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-3xl mx-auto">
            Plataforma nacional de rastreabilidade e controlo de qualidade do café angolano.
            Da produção à exportação, garantindo transparência e excelência.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8" onClick={() => window.location.href = "/verificar"}>
              Verificar Lote
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10" onClick={() => window.location.href = "/auth"}>
              Acesso ao Sistema
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">18+</div>
              <div className="text-muted-foreground">Províncias</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">5.000+</div>
              <div className="text-muted-foreground">Produtores</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">15k+</div>
              <div className="text-muted-foreground">Hectares</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">100%</div>
              <div className="text-muted-foreground">Rastreável</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Sistema Integrado de Rastreabilidade
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Uma solução completa para garantir a qualidade, origem e conformidade do café angolano
              nos mercados nacional e internacional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-border hover:shadow-medium transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Pronto para Começar?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Registe-se no sistema INCA Coffee Trace e faça parte da revolução digital
            da cafeicultura angolana.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8">
              Registar Entidade
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Saber Mais
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Coffee className="w-8 h-8" />
                <span className="text-xl font-bold">INCA Coffee Trace</span>
              </div>
              <p className="text-primary-foreground/80">
                Sistema Nacional de Rastreabilidade e Qualidade do Café
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Links Úteis</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Sobre o INCA</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Documentação</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Certificações</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Suporte</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contacto</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>Instituto Nacional do Café de Angola</li>
                <li>Luanda, Angola</li>
                <li>info@inca.gov.ao</li>
                <li>+244 XXX XXX XXX</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/60">
            <p>&copy; 2024 INCA - Instituto Nacional do Café de Angola. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
