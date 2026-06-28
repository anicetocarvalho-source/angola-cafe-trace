import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROVINCIAS_ANGOLA, type ProvinciaAngola } from "@/lib/provincias";
import { getMunicipios, getComunas } from "@/lib/dpa-angola";

export type LocalizacaoValue = {
  provincia: string;
  municipio: string;
  comuna: string;
};

type Props = {
  value: LocalizacaoValue;
  onChange: (v: LocalizacaoValue) => void;
  /** When true, includes an "all" option on each level (filter mode). */
  allowAll?: boolean;
  /** Hide the Comuna field. */
  hideComuna?: boolean;
  /** Mark Província/Município labels with `*`. */
  required?: boolean;
  /** Field-level error messages (e.g. from Zod). */
  errors?: Partial<Record<keyof LocalizacaoValue, string>>;
  /** Tailwind grid columns wrapper; defaults to `grid gap-4 md:grid-cols-3`. */
  className?: string;
  /** Hide the labels above each select. */
  hideLabels?: boolean;
  idPrefix?: string;
};

const ALL = "all";

const LocalizacaoSelect = ({
  value,
  onChange,
  allowAll = false,
  hideComuna = false,
  required = false,
  errors,
  className = "grid gap-4 md:grid-cols-3",
  hideLabels = false,
  idPrefix = "loc",
}: Props) => {
  const provincia = value.provincia;
  const municipio = value.municipio;
  const comuna = value.comuna;

  const municipios = useMemo(
    () =>
      provincia && provincia !== ALL
        ? getMunicipios(provincia as ProvinciaAngola)
        : [],
    [provincia],
  );

  const comunas = useMemo(
    () =>
      provincia && provincia !== ALL && municipio && municipio !== ALL
        ? getComunas(provincia as ProvinciaAngola, municipio)
        : [],
    [provincia, municipio],
  );

  const star = required ? " *" : "";

  return (
    <div className={className}>
      <div className="space-y-2">
        {!hideLabels && (
          <Label htmlFor={`${idPrefix}-provincia`}>Província{star}</Label>
        )}
        <Select
          value={provincia || (allowAll ? ALL : "")}
          onValueChange={(v) =>
            onChange({
              provincia: allowAll && v === ALL ? "" : v,
              municipio: "",
              comuna: "",
            })
          }
        >
          <SelectTrigger id={`${idPrefix}-provincia`}>
            <SelectValue placeholder="Seleccione província" />
          </SelectTrigger>
          <SelectContent>
            {allowAll && <SelectItem value={ALL}>Todas as províncias</SelectItem>}
            {PROVINCIAS_ANGOLA.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.provincia && (
          <p className="text-xs text-destructive">{errors.provincia}</p>
        )}
      </div>

      <div className="space-y-2">
        {!hideLabels && (
          <Label htmlFor={`${idPrefix}-municipio`}>Município{star}</Label>
        )}
        <Select
          value={municipio || (allowAll ? ALL : "")}
          onValueChange={(v) =>
            onChange({
              provincia,
              municipio: allowAll && v === ALL ? "" : v,
              comuna: "",
            })
          }
          disabled={!provincia}
        >
          <SelectTrigger id={`${idPrefix}-municipio`}>
            <SelectValue
              placeholder={
                provincia ? "Seleccione município" : "Escolha província primeiro"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {allowAll && (
              <SelectItem value={ALL}>Todos os municípios</SelectItem>
            )}
            {municipios.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.municipio && (
          <p className="text-xs text-destructive">{errors.municipio}</p>
        )}
      </div>

      {!hideComuna && (
        <div className="space-y-2">
          {!hideLabels && (
            <Label htmlFor={`${idPrefix}-comuna`}>Comuna</Label>
          )}
          <Select
            value={comuna || (allowAll ? ALL : "")}
            onValueChange={(v) =>
              onChange({
                provincia,
                municipio,
                comuna: allowAll && v === ALL ? "" : v,
              })
            }
            disabled={!municipio || comunas.length === 0}
          >
            <SelectTrigger id={`${idPrefix}-comuna`}>
              <SelectValue
                placeholder={
                  !municipio
                    ? "Escolha município primeiro"
                    : comunas.length === 0
                      ? "Sem comunas registadas"
                      : "Seleccione comuna"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {allowAll && <SelectItem value={ALL}>Todas as comunas</SelectItem>}
              {comunas.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.comuna && (
            <p className="text-xs text-destructive">{errors.comuna}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default LocalizacaoSelect;
