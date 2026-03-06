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
      acoes_controlo: {
        Row: {
          created_at: string
          data_conclusao: string | null
          descricao: string
          estado: Database["public"]["Enums"]["action_status"]
          id: string
          observacoes: string | null
          prazo: string | null
          responsavel: string | null
          tipo: string
          updated_at: string
          visita_id: string
        }
        Insert: {
          created_at?: string
          data_conclusao?: string | null
          descricao: string
          estado?: Database["public"]["Enums"]["action_status"]
          id?: string
          observacoes?: string | null
          prazo?: string | null
          responsavel?: string | null
          tipo: string
          updated_at?: string
          visita_id: string
        }
        Update: {
          created_at?: string
          data_conclusao?: string | null
          descricao?: string
          estado?: Database["public"]["Enums"]["action_status"]
          id?: string
          observacoes?: string | null
          prazo?: string | null
          responsavel?: string | null
          tipo?: string
          updated_at?: string
          visita_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "acoes_controlo_visita_id_fkey"
            columns: ["visita_id"]
            isOneToOne: false
            referencedRelation: "visitas_tecnicas"
            referencedColumns: ["id"]
          },
        ]
      }
      armazenamento: {
        Row: {
          armazem_nome: string
          created_at: string
          data_movimento: string
          humidade_percent: number | null
          id: string
          localizacao_armazem: string | null
          lote_id: string
          observacoes: string | null
          quantidade_kg: number
          responsavel: string | null
          temperatura_c: number | null
          tipo_movimento: string
          updated_at: string
        }
        Insert: {
          armazem_nome: string
          created_at?: string
          data_movimento?: string
          humidade_percent?: number | null
          id?: string
          localizacao_armazem?: string | null
          lote_id: string
          observacoes?: string | null
          quantidade_kg: number
          responsavel?: string | null
          temperatura_c?: number | null
          tipo_movimento: string
          updated_at?: string
        }
        Update: {
          armazem_nome?: string
          created_at?: string
          data_movimento?: string
          humidade_percent?: number | null
          id?: string
          localizacao_armazem?: string | null
          lote_id?: string
          observacoes?: string | null
          quantidade_kg?: number
          responsavel?: string | null
          temperatura_c?: number | null
          tipo_movimento?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "armazenamento_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string
          table_name: string
          timestamp: string
          user_email: string | null
          user_id: string
        }
        Insert: {
          action: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          table_name: string
          timestamp?: string
          user_email?: string | null
          user_id: string
        }
        Update: {
          action?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          table_name?: string
          timestamp?: string
          user_email?: string | null
          user_id?: string
        }
        Relationships: []
      }
      auditoria: {
        Row: {
          acao: string
          blockchain_tx_hash: string | null
          by_ip: string | null
          by_user_id: string | null
          created_at: string
          diff_json: Json | null
          entidade: string
          entidade_id: string
          hash: string | null
          id: string
        }
        Insert: {
          acao: string
          blockchain_tx_hash?: string | null
          by_ip?: string | null
          by_user_id?: string | null
          created_at?: string
          diff_json?: Json | null
          entidade: string
          entidade_id: string
          hash?: string | null
          id?: string
        }
        Update: {
          acao?: string
          blockchain_tx_hash?: string | null
          by_ip?: string | null
          by_user_id?: string | null
          created_at?: string
          diff_json?: Json | null
          entidade?: string
          entidade_id?: string
          hash?: string | null
          id?: string
        }
        Relationships: []
      }
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
      comercializacao: {
        Row: {
          comprador_id: string | null
          contrato_ref: string | null
          created_at: string
          data_contrato: string | null
          id: string
          incoterm: string | null
          lote_id: string
          moeda: string | null
          preco_unitario: number | null
          quantidade_kg: number | null
          updated_at: string
        }
        Insert: {
          comprador_id?: string | null
          contrato_ref?: string | null
          created_at?: string
          data_contrato?: string | null
          id?: string
          incoterm?: string | null
          lote_id: string
          moeda?: string | null
          preco_unitario?: number | null
          quantidade_kg?: number | null
          updated_at?: string
        }
        Update: {
          comprador_id?: string | null
          contrato_ref?: string | null
          created_at?: string
          data_contrato?: string | null
          id?: string
          incoterm?: string | null
          lote_id?: string
          moeda?: string | null
          preco_unitario?: number | null
          quantidade_kg?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comercializacao_comprador_id_fkey"
            columns: ["comprador_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comercializacao_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
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
      exportacoes: {
        Row: {
          bl_ref: string | null
          booking: string | null
          certificado_origem_url: string | null
          created_at: string
          data_embarque: string | null
          du_ref: string | null
          eudr_pacote_id: string | null
          exportador_id: string
          id: string
          invoice_url: string | null
          lote_ids: string[]
          navio: string | null
          packing_list_url: string | null
          pais_destino: string | null
          porto: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          bl_ref?: string | null
          booking?: string | null
          certificado_origem_url?: string | null
          created_at?: string
          data_embarque?: string | null
          du_ref?: string | null
          eudr_pacote_id?: string | null
          exportador_id: string
          id?: string
          invoice_url?: string | null
          lote_ids: string[]
          navio?: string | null
          packing_list_url?: string | null
          pais_destino?: string | null
          porto?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          bl_ref?: string | null
          booking?: string | null
          certificado_origem_url?: string | null
          created_at?: string
          data_embarque?: string | null
          du_ref?: string | null
          eudr_pacote_id?: string | null
          exportador_id?: string
          id?: string
          invoice_url?: string | null
          lote_ids?: string[]
          navio?: string | null
          packing_list_url?: string | null
          pais_destino?: string | null
          porto?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exportacoes_exportador_id_fkey"
            columns: ["exportador_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      harvests: {
        Row: {
          created_at: string
          created_by: string
          harvest_date: string
          id: string
          notes: string | null
          parcela_id: string
          quality_score: number | null
          quantity: number
          status: string
          unit: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          harvest_date: string
          id?: string
          notes?: string | null
          parcela_id: string
          quality_score?: number | null
          quantity: number
          status?: string
          unit?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          harvest_date?: string
          id?: string
          notes?: string | null
          parcela_id?: string
          quality_score?: number | null
          quantity?: number
          status?: string
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "harvests_parcela_id_fkey"
            columns: ["parcela_id"]
            isOneToOne: false
            referencedRelation: "parcelas"
            referencedColumns: ["id"]
          },
        ]
      }
      iot_leituras: {
        Row: {
          assinatura: string | null
          created_at: string
          data_hora: string
          dispositivo_id: string
          id: string
          latitude: number | null
          longitude: number | null
          lote_id: string | null
          origem_fabricante: string | null
          secagem_id: string | null
          tipo: string
          unidade: string | null
          valor_decimal: number | null
        }
        Insert: {
          assinatura?: string | null
          created_at?: string
          data_hora?: string
          dispositivo_id: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          lote_id?: string | null
          origem_fabricante?: string | null
          secagem_id?: string | null
          tipo: string
          unidade?: string | null
          valor_decimal?: number | null
        }
        Update: {
          assinatura?: string | null
          created_at?: string
          data_hora?: string
          dispositivo_id?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          lote_id?: string | null
          origem_fabricante?: string | null
          secagem_id?: string | null
          tipo?: string
          unidade?: string | null
          valor_decimal?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "iot_leituras_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iot_leituras_secagem_id_fkey"
            columns: ["secagem_id"]
            isOneToOne: false
            referencedRelation: "secagens"
            referencedColumns: ["id"]
          },
        ]
      }
      iot_sensors: {
        Row: {
          created_at: string
          id: string
          last_reading_at: string | null
          location: string | null
          name: string
          parcela_id: string | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_reading_at?: string | null
          location?: string | null
          name: string
          parcela_id?: string | null
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_reading_at?: string | null
          location?: string | null
          name?: string
          parcela_id?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iot_sensors_parcela_id_fkey"
            columns: ["parcela_id"]
            isOneToOne: false
            referencedRelation: "parcelas"
            referencedColumns: ["id"]
          },
        ]
      }
      logistica: {
        Row: {
          checkpoints: Json | null
          created_at: string
          documentos: string[] | null
          humidade_media_percent: number | null
          id: string
          lote_id: string
          rota: string | null
          temp_media_c: number | null
          transportador_id: string | null
          updated_at: string
          veiculo: string | null
        }
        Insert: {
          checkpoints?: Json | null
          created_at?: string
          documentos?: string[] | null
          humidade_media_percent?: number | null
          id?: string
          lote_id: string
          rota?: string | null
          temp_media_c?: number | null
          transportador_id?: string | null
          updated_at?: string
          veiculo?: string | null
        }
        Update: {
          checkpoints?: Json | null
          created_at?: string
          documentos?: string[] | null
          humidade_media_percent?: number | null
          id?: string
          lote_id?: string
          rota?: string | null
          temp_media_c?: number | null
          transportador_id?: string | null
          updated_at?: string
          veiculo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "logistica_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "logistica_transportador_id_fkey"
            columns: ["transportador_id"]
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
      manutencao_agricola: {
        Row: {
          area_aplicada_ha: number | null
          created_at: string
          custo_estimado: number | null
          data_execucao: string
          descricao: string | null
          id: string
          observacoes: string | null
          parcela_id: string
          produtos_utilizados: string[] | null
          quantidade_produto: number | null
          responsavel: string | null
          tipo: string
          unidade_produto: string | null
          updated_at: string
        }
        Insert: {
          area_aplicada_ha?: number | null
          created_at?: string
          custo_estimado?: number | null
          data_execucao: string
          descricao?: string | null
          id?: string
          observacoes?: string | null
          parcela_id: string
          produtos_utilizados?: string[] | null
          quantidade_produto?: number | null
          responsavel?: string | null
          tipo: string
          unidade_produto?: string | null
          updated_at?: string
        }
        Update: {
          area_aplicada_ha?: number | null
          created_at?: string
          custo_estimado?: number | null
          data_execucao?: string
          descricao?: string | null
          id?: string
          observacoes?: string | null
          parcela_id?: string
          produtos_utilizados?: string[] | null
          quantidade_produto?: number | null
          responsavel?: string | null
          tipo?: string
          unidade_produto?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "manutencao_agricola_parcela_id_fkey"
            columns: ["parcela_id"]
            isOneToOne: false
            referencedRelation: "parcelas"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
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
          avatar_url: string | null
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
          avatar_url?: string | null
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
          avatar_url?: string | null
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
      qualidade_certificacoes: {
        Row: {
          certificacoes_emitidas: string[] | null
          certificado_pdf_url: string | null
          created_at: string
          id: string
          laboratorio: string | null
          lote_id: string
          parametros: Json | null
          resultado: string | null
          tipo: string
          updated_at: string
          validade_ate: string | null
        }
        Insert: {
          certificacoes_emitidas?: string[] | null
          certificado_pdf_url?: string | null
          created_at?: string
          id?: string
          laboratorio?: string | null
          lote_id: string
          parametros?: Json | null
          resultado?: string | null
          tipo: string
          updated_at?: string
          validade_ate?: string | null
        }
        Update: {
          certificacoes_emitidas?: string[] | null
          certificado_pdf_url?: string | null
          created_at?: string
          id?: string
          laboratorio?: string | null
          lote_id?: string
          parametros?: Json | null
          resultado?: string | null
          tipo?: string
          updated_at?: string
          validade_ate?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qualidade_certificacoes_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
        ]
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
      sensor_readings: {
        Row: {
          id: string
          metadata: Json | null
          sensor_id: string
          timestamp: string
          unit: string
          value: number
        }
        Insert: {
          id?: string
          metadata?: Json | null
          sensor_id: string
          timestamp?: string
          unit: string
          value: number
        }
        Update: {
          id?: string
          metadata?: Json | null
          sensor_id?: string
          timestamp?: string
          unit?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "sensor_readings_sensor_id_fkey"
            columns: ["sensor_id"]
            isOneToOne: false
            referencedRelation: "iot_sensors"
            referencedColumns: ["id"]
          },
        ]
      }
      sim_mercado: {
        Row: {
          created_at: string
          data_referencia: string
          fonte: string
          id: string
          indicador: string
          localizacao: string | null
          unidade: string | null
          valor: number | null
        }
        Insert: {
          created_at?: string
          data_referencia: string
          fonte: string
          id?: string
          indicador: string
          localizacao?: string | null
          unidade?: string | null
          valor?: number | null
        }
        Update: {
          created_at?: string
          data_referencia?: string
          fonte?: string
          id?: string
          indicador?: string
          localizacao?: string | null
          unidade?: string | null
          valor?: number | null
        }
        Relationships: []
      }
      transformacoes: {
        Row: {
          created_at: string
          data: string
          etapa: string
          id: string
          lote_id: string
          parametros_json: Json | null
          rendimento_percent: number | null
          responsavel_id: string | null
          resultado_lote_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: string
          etapa: string
          id?: string
          lote_id: string
          parametros_json?: Json | null
          rendimento_percent?: number | null
          responsavel_id?: string | null
          resultado_lote_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: string
          etapa?: string
          id?: string
          lote_id?: string
          parametros_json?: Json | null
          rendimento_percent?: number | null
          responsavel_id?: string | null
          resultado_lote_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transformacoes_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transformacoes_resultado_lote_id_fkey"
            columns: ["resultado_lote_id"]
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
      visitas_tecnicas: {
        Row: {
          conformidade_geral: string | null
          created_at: string
          data_visita: string
          estado: Database["public"]["Enums"]["visit_status"]
          exploracao_id: string
          fotos_urls: string[] | null
          id: string
          objetivo: string | null
          observacoes: string | null
          tecnico_id: string
          tipo: Database["public"]["Enums"]["visit_type"]
          updated_at: string
        }
        Insert: {
          conformidade_geral?: string | null
          created_at?: string
          data_visita: string
          estado?: Database["public"]["Enums"]["visit_status"]
          exploracao_id: string
          fotos_urls?: string[] | null
          id?: string
          objetivo?: string | null
          observacoes?: string | null
          tecnico_id: string
          tipo?: Database["public"]["Enums"]["visit_type"]
          updated_at?: string
        }
        Update: {
          conformidade_geral?: string | null
          created_at?: string
          data_visita?: string
          estado?: Database["public"]["Enums"]["visit_status"]
          exploracao_id?: string
          fotos_urls?: string[] | null
          id?: string
          objetivo?: string | null
          observacoes?: string | null
          tecnico_id?: string
          tipo?: Database["public"]["Enums"]["visit_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visitas_tecnicas_exploracao_id_fkey"
            columns: ["exploracao_id"]
            isOneToOne: false
            referencedRelation: "exploracoes"
            referencedColumns: ["id"]
          },
        ]
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
      action_status: "pendente" | "em_curso" | "concluida" | "nao_cumprida"
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
      visit_status: "agendada" | "em_curso" | "realizada" | "cancelada"
      visit_type: "rotina" | "fiscalizacao" | "acompanhamento" | "emergencia"
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
      action_status: ["pendente", "em_curso", "concluida", "nao_cumprida"],
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
      visit_status: ["agendada", "em_curso", "realizada", "cancelada"],
      visit_type: ["rotina", "fiscalizacao", "acompanhamento", "emergencia"],
    },
  },
} as const
