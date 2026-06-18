import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n, type Lang } from "@/lib/i18n";
import { useTheme, type Theme } from "@/lib/theme";
import { Sun, Moon, MonitorSmartphone, Languages, Palette } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — Student Hub" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { lang, setLang, t } = useI18n();
  const { theme, setTheme } = useTheme();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("Settings")}</h1>
        <p className="mt-1 text-muted-foreground">Personalize how Student Hub looks and reads for you.</p>
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">{t("Theme")}</h2>
        </div>
        <RadioGroup value={theme} onValueChange={(v) => setTheme(v as Theme)} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { v: "light", label: t("Light"), Icon: Sun },
            { v: "dark", label: t("Dark"), Icon: Moon },
            { v: "default", label: t("Default"), Icon: MonitorSmartphone },
          ].map(({ v, label, Icon }) => (
            <Label key={v} htmlFor={`theme-${v}`}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${theme === v ? "border-primary bg-primary/5" : "hover:bg-accent"}`}>
              <RadioGroupItem id={`theme-${v}`} value={v} />
              <Icon className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{label}</span>
            </Label>
          ))}
        </RadioGroup>
      </Card>

      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Languages className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">{t("Language")}</h2>
        </div>
        <Select value={lang} onValueChange={(v) => setLang(v as Lang)}>
          <SelectTrigger className="w-full sm:w-80"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="en">{t("English")}</SelectItem>
            <SelectItem value="ta">{t("Tamil")}</SelectItem>
            <SelectItem value="hi">{t("Hindi")}</SelectItem>
          </SelectContent>
        </Select>
        <p className="mt-3 text-xs text-muted-foreground">UI labels translate instantly. Page content not yet translated will stay in English.</p>
      </Card>
    </div>
  );
}
