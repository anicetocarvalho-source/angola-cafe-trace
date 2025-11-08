import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function QRScanner() {
  const [open, setOpen] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!qrCode.trim()) {
      toast.error("Por favor, insira um código QR");
      return;
    }

    setSearching(true);
    try {
      // Search by QR code
      const { data: lote, error } = await supabase
        .from("lotes")
        .select("id, referencia_lote, qr_code")
        .eq("qr_code", qrCode.trim())
        .single();

      if (error || !lote) {
        toast.error("Lote não encontrado com este código QR");
        return;
      }

      toast.success(`Lote encontrado: ${lote.referencia_lote}`);
      setOpen(false);
      setQrCode("");
      navigate(`/lotes/${lote.id}`);
    } catch (error) {
      console.error("Error searching lot:", error);
      toast.error("Erro ao procurar lote");
    } finally {
      setSearching(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <QrCode className="h-4 w-4" />
        Escanear QR
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verificar Lote por QR Code</DialogTitle>
            <DialogDescription>
              Insira o código QR manualmente ou use a câmera para escanear
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="qrCode">Código QR</Label>
              <Input
                id="qrCode"
                placeholder="QR-1234567890"
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
            </div>

            <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
              <p className="font-medium mb-2">💡 Dica:</p>
              <p>
                Para melhor experiência, utilize um leitor de QR Code dedicado
                ou instale a app como PWA para acesso à câmera.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSearch}
                disabled={searching}
                className="flex-1"
              >
                <Search className="h-4 w-4 mr-2" />
                {searching ? "A procurar..." : "Procurar"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setQrCode("");
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
