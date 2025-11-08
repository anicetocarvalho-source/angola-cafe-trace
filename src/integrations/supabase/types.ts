export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      colheitas: {
        Row: {
          campanha: string
          created_at: string
          data_fim: string | null
          data_inicio: string
          id: string
          metodo_colheita: string | null
          parcela_id: string
          updated_at: string
          volume_cereja_kg: number | null
        }
        Insert: {
          campanha: string
          created_at?: string
          data_fim?: string | null
          data_inicio: string
          id?: string
          metodo_colheita?: string | null
          parcela_id: string
          updated_at?: string
          volume_cereja_kg?: number | null
        }
        Update: {
          campanha?: string
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          id?: string
          metodo_colheita?: string | null
          parcela_id?: string
          updated_at?: string
          volume_cereja_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "colheitas_parcela_id_fkey"
            columns: ["parcela_id"]
            isOneToOne: false
            referencedRelation: "parcelas"
            referencedColumns: ["id"]
          },
        ]
      }
      entities: {
        Row: {
          certificacoes: string[] | null
          contacto_email: string | null
          contacto_telefone: string | null
          created_at: string
          endereco: string | null
          eudr_compliant: boolean | null
          id: string
          municipio: string | null
          nif: string | null
          nome_legal: string
          provincia: string | null
          tipo: Database["public"]["Enums"]["entity_type"]
          updated_at: string
        }
        Insert: {
          certificacoes?: string[] | null
          contacto_email?: string | null
          contacto_telefone?: string | null
          created_at?: string
          endereco?: string | null
          eudr_compliant?: boolean | null
          id?: string
          municipio?: string | null
          nif?: string | null
          nome_legal: string
          provincia?: string | null
          tipo: Database["public"]["Enums"]["entity_type"]
          updated_at?: string
        }
        Update: {
          certificacoes?: string[] | null
          contacto_email?: string | null
          contacto_telefone?: string | null
          created_at?: string
          endereco?: string | null
          eudr_compliant?: boolean | null
          id?: string
          municipio?: string | null
          nif?: string | null
          nome_legal?: string
          provincia?: string | null
          tipo?: Database["public"]["Enums"]["entity_type"]
          updated_at?: string
        }
        Relationships: []
      }
      exploracoes: {
        Row: {
          aldeia: string | null
          altitude_m: number | null
          area_ha: number | null
          comuna: string | null
          created_at: string
          designacao: string
          id: string
          latitude: number | null
          longitude: number | null
          municipio: string
          produtor_id: string
          provincia: string
          status: string | null
          updated_at: string
          validado_at: string | null
          validado_por: string | null
        }
        Insert: {
          aldeia?: string | null
          altitude_m?: number | null
          area_ha?: number | null
          comuna?: string | null
          created_at?: string
          designacao: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          municipio: string
          produtor_id: string
          provincia: string
          status?: string | null
          updated_at?: string
          validado_at?: string | null
          validado_por?: string | null
        }
        Update: {
          aldeia?: string | null
          altitude_m?: number | null
          area_ha?: number | null
          comuna?: string | null
          created_at?: string
          designacao?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          municipio?: string
          produtor_id?: string
          provincia?: string
          status?: string | null
          updated_at?: string
          validado_at?: string | null
          validado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exploracoes_produtor_id_fkey"
            columns: ["produtor_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      lotes: {
        Row: {
          blockchain_tx_hash: string | null
          classificacao_sensorial: number | null
          colheita_id: string | null
          created_at: string
          defeitos_ppm: number | null
          estado: Database["public"]["Enums"]["lot_status"] | null
          humidade_percent: number | null
          id: string
          qr_code: string | null
          referencia_lote: string
          rfid_uid: string | null
          temperatura_c: number | null
          tipo: Database["public"]["Enums"]["lot_type"]
          updated_at: string
          volume_kg: number
        }
        Insert: {
          blockchain_tx_hash?: string | null
          classificacao_sensorial?: number | null
          colheita_id?: string | null
          created_at?: string
          defeitos_ppm?: number | null
          estado?: Database["public"]["Enums"]["lot_status"] | null
          humidade_percent?: number | null
          id?: string
          qr_code?: string | null
          referencia_lote: string
          rfid_uid?: string | null
          temperatura_c?: number | null
          tipo?: Database["public"]["Enums"]["lot_type"]
          updated_at?: string
          volume_kg: number
        }
        Update: {
          blockchain_tx_hash?: string | null
          classificacao_sensorial?: number | null
          colheita_id?: string | null
          created_at?: string
          defeitos_ppm?: number | null
          estado?: Database["public"]["Enums"]["lot_status"] | null
          humidade_percent?: number | null
          id?: string
          qr_code?: string | null
          referencia_lote?: string
          rfid_uid?: string | null
          temperatura_c?: number | null
          tipo?: Database["public"]["Enums"]["lot_type"]
          updated_at?: string
          volume_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "lotes_colheita_id_fkey"
            columns: ["colheita_id"]
            isOneToOne: false
            referencedRelation: "colheitas"
            referencedColumns: ["id"]
          },
        ]
      }
      parcelas: {
        Row: {
          ano_plantio: number | null
          area_ha: number | null
          codigo_parcela: string
          created_at: string
          exploracao_id: string
          id: string
          irrigacao: boolean | null
          praticas_agricolas: string[] | null
          sombra_percent: number | null
          updated_at: string
          varietais: string[] | null
        }
        Insert: {
          ano_plantio?: number | null
          area_ha?: number | null
          codigo_parcela: string
          created_at?: string
          exploracao_id: string
          id?: string
          irrigacao?: boolean | null
          praticas_agricolas?: string[] | null
          sombra_percent?: number | null
          updated_at?: string
          varietais?: string[] | null
        }
        Update: {
          ano_plantio?: number | null
          area_ha?: number | null
          codigo_parcela?: string
          created_at?: string
          exploracao_id?: string
          id?: string
          irrigacao?: boolean | null
          praticas_agricolas?: string[] | null
          sombra_percent?: number | null
          updated_at?: string
          varietais?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "parcelas_exploracao_id_fkey"
            columns: ["exploracao_id"]
            isOneToOne: false
            referencedRelation: "exploracoes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          entidade_id: string | null
          id: string
          nome: string
          telemovel: string | null
          termos_aceites_at: string | null
          ultimo_login_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          entidade_id?: string | null
          id: string
          nome: string
          telemovel?: string | null
          termos_aceites_at?: string | null
          ultimo_login_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          entidade_id?: string | null
          id?: string
          nome?: string
          telemovel?: string | null
          termos_aceites_at?: string | null
          ultimo_login_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      secagens: {
        Row: {
          created_at: string
          data_fim: string | null
          data_inicio: string
          humidade_final_percent: number | null
          id: string
          lote_id: string
          metodo: string
          notas: string | null
          temp_media_c: number | null
          tempo_total_h: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_fim?: string | null
          data_inicio: string
          humidade_final_percent?: number | null
          id?: string
          lote_id: string
          metodo: string
          notas?: string | null
          temp_media_c?: number | null
          tempo_total_h?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          humidade_final_percent?: number | null
          id?: string
          lote_id?: string
          metodo?: string
          notas?: string | null
          temp_media_c?: number | null
          tempo_total_h?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "secagens_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_lot_reference: { Args: never; Returns: string }
      generate_qr_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin_inca"
        | "tecnico_inca"
        | "produtor"
        | "cooperativa"
        | "processador"
        | "transportador"
        | "exportador"
        | "comprador"
      entity_type:
        | "produtor"
        | "cooperativa"
        | "processador"
        | "exportador"
        | "transportador"
        | "institucional"
      lot_status:
        | "pendente"
        | "em_processo"
        | "aprovado"
        | "reprovado"
        | "exportado"
        | "consumido"
      lot_type: "cereja" | "cafe_verde" | "parchment" | "torrado" | "moido"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin_inca",
        "tecnico_inca",
        "produtor",
        "cooperativa",
        "processador",
        "transportador",
        "exportador",
        "comprador",
      ],
      entity_type: [
        "produtor",
        "cooperativa",
        "processador",
        "exportador",
        "transportador",
        "institucional",
      ],
      lot_status: [
        "pendente",
        "em_processo",
        "aprovado",
        "reprovado",
        "exportado",
        "consumido",
      ],
      lot_type: ["cereja", "cafe_verde", "parchment", "torrado", "moido"],
    },
  },
} as const
