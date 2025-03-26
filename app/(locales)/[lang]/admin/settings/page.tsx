'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { SettingsIcon, UserCog, Globe, Bell, Shield } from 'lucide-react';

interface SettingsPageProps {
  params: {
    lang: string;
  };
  dictionary?: {
    admin?: {
      settings?: {
        title?: string;
        general?: string;
        security?: string;
        notifications?: string;
        localization?: string;
        save?: string;
        cancel?: string;
        siteTitle?: string;
        siteDescription?: string;
        logoUrl?: string;
        maintenanceMode?: string;
        maintenanceModeDesc?: string;
        defaultCoins?: string;
        defaultCoinsDesc?: string;
        adminEmail?: string;
        maxProductsPerUser?: string;
        maxProductsPerUserDesc?: string;
        enableRegistration?: string;
        requireEmailVerification?: string;
        enableNotifications?: string;
        notificationEmail?: string;
        defaultLanguage?: string;
        timeZone?: string;
        dateFormat?: string;
        savedSuccess?: string;
        savedError?: string;
      };
    };
  };
}

// Definir el esquema de validación para el formulario de configuración general
const generalFormSchema = z.object({
  siteTitle: z.string().min(2, {
    message: 'El título del sitio debe tener al menos 2 caracteres.',
  }),
  siteDescription: z.string().max(500, {
    message: 'La descripción no puede tener más de 500 caracteres.',
  }),
  logoUrl: z.string().url({
    message: 'Por favor, introduce una URL válida.',
  }).optional().or(z.literal('')),
  maintenanceMode: z.boolean().default(false),
  defaultCoins: z.number().int().positive({
    message: 'El valor debe ser un número positivo.',
  }).default(50),
  adminEmail: z.string().email({
    message: 'Por favor, introduce un email válido.',
  }),
  maxProductsPerUser: z.number().int().positive({
    message: 'El valor debe ser un número positivo.',
  }).default(1),
});

type GeneralFormValues = z.infer<typeof generalFormSchema>;

// Definir el esquema de validación para el formulario de seguridad
const securityFormSchema = z.object({
  enableRegistration: z.boolean().default(true),
  requireEmailVerification: z.boolean().default(true),
});

type SecurityFormValues = z.infer<typeof securityFormSchema>;

// Definir el esquema de validación para el formulario de notificaciones
const notificationsFormSchema = z.object({
  enableNotifications: z.boolean().default(true),
  notificationEmail: z.string().email({
    message: 'Por favor, introduce un email válido.',
  }),
});

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>;

// Definir el esquema de validación para el formulario de localización
const localizationFormSchema = z.object({
  defaultLanguage: z.string().min(2, {
    message: 'Por favor, selecciona un idioma.',
  }),
  timeZone: z.string().min(1, {
    message: 'Por favor, selecciona una zona horaria.',
  }),
  dateFormat: z.string().min(1, {
    message: 'Por favor, selecciona un formato de fecha.',
  }),
});

type LocalizationFormValues = z.infer<typeof localizationFormSchema>;

export default function SettingsPage({ params, dictionary }: SettingsPageProps) {
  const { lang } = params;
  const [activeTab, setActiveTab] = useState('general');
  
  // Traducciones con valores por defecto
  const translations = {
    title: dictionary?.admin?.settings?.title || 'Configuración del Sistema',
    general: dictionary?.admin?.settings?.general || 'General',
    security: dictionary?.admin?.settings?.security || 'Seguridad',
    notifications: dictionary?.admin?.settings?.notifications || 'Notificaciones',
    localization: dictionary?.admin?.settings?.localization || 'Localización',
    save: dictionary?.admin?.settings?.save || 'Guardar Cambios',
    cancel: dictionary?.admin?.settings?.cancel || 'Cancelar',
    siteTitle: dictionary?.admin?.settings?.siteTitle || 'Título del Sitio',
    siteDescription: dictionary?.admin?.settings?.siteDescription || 'Descripción del Sitio',
    logoUrl: dictionary?.admin?.settings?.logoUrl || 'URL del Logo',
    maintenanceMode: dictionary?.admin?.settings?.maintenanceMode || 'Modo Mantenimiento',
    maintenanceModeDesc: dictionary?.admin?.settings?.maintenanceModeDesc || 'Activa el modo de mantenimiento para bloquear el acceso a usuarios no administradores',
    defaultCoins: dictionary?.admin?.settings?.defaultCoins || 'Monedas por Defecto',
    defaultCoinsDesc: dictionary?.admin?.settings?.defaultCoinsDesc || 'Cantidad de monedas asignadas a nuevos usuarios',
    adminEmail: dictionary?.admin?.settings?.adminEmail || 'Email de Administración',
    maxProductsPerUser: dictionary?.admin?.settings?.maxProductsPerUser || 'Máximo de Productos por Usuario',
    maxProductsPerUserDesc: dictionary?.admin?.settings?.maxProductsPerUserDesc || 'Número máximo de productos que un usuario puede tener en su carrito',
    enableRegistration: dictionary?.admin?.settings?.enableRegistration || 'Permitir Registro de Usuarios',
    requireEmailVerification: dictionary?.admin?.settings?.requireEmailVerification || 'Requerir Verificación de Email',
    enableNotifications: dictionary?.admin?.settings?.enableNotifications || 'Habilitar Notificaciones',
    notificationEmail: dictionary?.admin?.settings?.notificationEmail || 'Email para Notificaciones',
    defaultLanguage: dictionary?.admin?.settings?.defaultLanguage || 'Idioma por Defecto',
    timeZone: dictionary?.admin?.settings?.timeZone || 'Zona Horaria',
    dateFormat: dictionary?.admin?.settings?.dateFormat || 'Formato de Fecha',
    savedSuccess: dictionary?.admin?.settings?.savedSuccess || 'Configuración guardada correctamente',
    savedError: dictionary?.admin?.settings?.savedError || 'Error al guardar la configuración'
  };
  
  // Valores predeterminados para el formulario general
  const defaultGeneralValues: Partial<GeneralFormValues> = {
    siteTitle: 'Nestlé QR Experience',
    siteDescription: 'Plataforma para escanear productos Nestlé y obtener recompensas',
    logoUrl: 'https://example.com/logo.png',
    maintenanceMode: false,
    defaultCoins: 50,
    adminEmail: 'admin@example.com',
    maxProductsPerUser: 1,
  };
  
  // Valores predeterminados para el formulario de seguridad
  const defaultSecurityValues: Partial<SecurityFormValues> = {
    enableRegistration: true,
    requireEmailVerification: true,
  };
  
  // Valores predeterminados para el formulario de notificaciones
  const defaultNotificationsValues: Partial<NotificationsFormValues> = {
    enableNotifications: true,
    notificationEmail: 'notificaciones@example.com',
  };
  
  // Valores predeterminados para el formulario de localización
  const defaultLocalizationValues: Partial<LocalizationFormValues> = {
    defaultLanguage: 'es',
    timeZone: 'Europe/Madrid',
    dateFormat: 'DD/MM/YYYY',
  };

  // Inicializar formulario para configuración general
  const generalForm = useForm<GeneralFormValues>({
    resolver: zodResolver(generalFormSchema),
    defaultValues: defaultGeneralValues,
  });

  // Inicializar formulario para seguridad
  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: defaultSecurityValues,
  });

  // Inicializar formulario para notificaciones
  const notificationsForm = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: defaultNotificationsValues,
  });

  // Inicializar formulario para localización
  const localizationForm = useForm<LocalizationFormValues>({
    resolver: zodResolver(localizationFormSchema),
    defaultValues: defaultLocalizationValues,
  });

  // Manejar envío del formulario general
  function onGeneralSubmit(data: GeneralFormValues) {
    // Aquí normalmente enviaríamos los datos al servidor
    console.log('Configuración general:', data);
    toast.success(translations.savedSuccess);
  }

  // Manejar envío del formulario de seguridad
  function onSecuritySubmit(data: SecurityFormValues) {
    console.log('Configuración de seguridad:', data);
    toast.success(translations.savedSuccess);
  }

  // Manejar envío del formulario de notificaciones
  function onNotificationsSubmit(data: NotificationsFormValues) {
    console.log('Configuración de notificaciones:', data);
    toast.success(translations.savedSuccess);
  }

  // Manejar envío del formulario de localización
  function onLocalizationSubmit(data: LocalizationFormValues) {
    console.log('Configuración de localización:', data);
    toast.success(translations.savedSuccess);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{translations.title}</h1>
      
      <Tabs 
        defaultValue="general" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center">
            <SettingsIcon className="h-4 w-4 mr-2" />
            {translations.general}
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            {translations.security}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="h-4 w-4 mr-2" />
            {translations.notifications}
          </TabsTrigger>
          <TabsTrigger value="localization" className="flex items-center">
            <Globe className="h-4 w-4 mr-2" />
            {translations.localization}
          </TabsTrigger>
        </TabsList>
        
        {/* Pestaña de configuración general */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>{translations.general}</CardTitle>
              <CardDescription>
                Configuraciones básicas del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...generalForm}>
                <form onSubmit={generalForm.handleSubmit(onGeneralSubmit)} id="general-form" className="space-y-6">
                  <FormField
                    control={generalForm.control}
                    name="siteTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{translations.siteTitle}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={generalForm.control}
                    name="siteDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{translations.siteDescription}</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={generalForm.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{translations.logoUrl}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Separator />
                  
                  <FormField
                    control={generalForm.control}
                    name="maintenanceMode"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            {translations.maintenanceMode}
                          </FormLabel>
                          <FormDescription>
                            {translations.maintenanceModeDesc}
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={generalForm.control}
                      name="defaultCoins"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{translations.defaultCoins}</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={e => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            {translations.defaultCoinsDesc}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={generalForm.control}
                      name="maxProductsPerUser"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{translations.maxProductsPerUser}</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={e => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            {translations.maxProductsPerUserDesc}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={generalForm.control}
                    name="adminEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{translations.adminEmail}</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => generalForm.reset()}
              >
                {translations.cancel}
              </Button>
              <Button 
                type="submit"
                form="general-form"
              >
                {translations.save}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Pestaña de seguridad */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>{translations.security}</CardTitle>
              <CardDescription>
                Configuraciones de seguridad y acceso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...securityForm}>
                <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} id="security-form" className="space-y-6">
                  <FormField
                    control={securityForm.control}
                    name="enableRegistration"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            {translations.enableRegistration}
                          </FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={securityForm.control}
                    name="requireEmailVerification"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            {translations.requireEmailVerification}
                          </FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => securityForm.reset()}
              >
                {translations.cancel}
              </Button>
              <Button 
                type="submit"
                form="security-form"
              >
                {translations.save}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Pestaña de notificaciones */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{translations.notifications}</CardTitle>
              <CardDescription>
                Configuraciones para el sistema de notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationsForm}>
                <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)} id="notifications-form" className="space-y-6">
                  <FormField
                    control={notificationsForm.control}
                    name="enableNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            {translations.enableNotifications}
                          </FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={notificationsForm.control}
                    name="notificationEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{translations.notificationEmail}</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => notificationsForm.reset()}
              >
                {translations.cancel}
              </Button>
              <Button 
                type="submit"
                form="notifications-form"
              >
                {translations.save}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Pestaña de localización */}
        <TabsContent value="localization">
          <Card>
            <CardHeader>
              <CardTitle>{translations.localization}</CardTitle>
              <CardDescription>
                Configuraciones de idioma, zona horaria y formato
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...localizationForm}>
                <form onSubmit={localizationForm.handleSubmit(onLocalizationSubmit)} id="localization-form" className="space-y-6">
                  <FormField
                    control={localizationForm.control}
                    name="defaultLanguage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{translations.defaultLanguage}</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="es">Español</option>
                            <option value="en">English</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={localizationForm.control}
                    name="timeZone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{translations.timeZone}</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="Europe/Madrid">Europe/Madrid</option>
                            <option value="America/New_York">America/New_York</option>
                            <option value="America/Los_Angeles">America/Los_Angeles</option>
                            <option value="Asia/Tokyo">Asia/Tokyo</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={localizationForm.control}
                    name="dateFormat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{translations.dateFormat}</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => localizationForm.reset()}
              >
                {translations.cancel}
              </Button>
              <Button 
                type="submit"
                form="localization-form"
              >
                {translations.save}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 