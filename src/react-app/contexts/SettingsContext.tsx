import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'fr';
type Theme = 'light' | 'dark';

interface SettingsContextType {
  language: Language;
  theme: Theme;
  setLanguage: (language: Language) => void;
  setTheme: (theme: Theme) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Common
    'app.name': 'leftknovers',
    'app.tagline': 'Track leftovers, reduce waste',
    'app.description': 'Smart leftovers tracking to reduce food waste',
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
    'cancel': 'Cancel',
    'save': 'Save',
    'delete': 'Delete',
    'edit': 'Edit',
    'close': 'Close',
    'add': 'Add',
    'send': 'Send',
    'back': 'Back',
    'next': 'Next',
    'done': 'Done',
    'yes': 'Yes',
    'no': 'No',
    
    // Navigation
    'nav.home': 'Home',
    'nav.analytics': 'Analytics',
    
    // Login
    'login.title': 'Welcome to leftknovers',
    'login.subtitle': 'Track leftovers, reduce waste, save money',
    'login.signin': 'Sign in to your account',
    'login.getStarted': 'Start managing your food inventory today',
    'login.continueGoogle': 'Continue with Google',
    'login.whyChoose': 'Why choose leftknovers?',
    'login.feature1.title': 'Smart Expiration Tracking',
    'login.feature1.desc': 'Get notified before food expires',
    'login.feature2.title': 'Photo Recognition',
    'login.feature2.desc': 'Snap photos to quickly add items',
    'login.feature3.title': 'Reduce Food Waste',
    'login.feature3.desc': 'Save money and help the environment',
    'login.terms': 'By signing in, you agree to our terms of service and privacy policy',
    'login.completingSignin': 'Completing sign in...',
    'login.setupAccount': 'Please wait while we set up your account',
    'login.welcome': 'Welcome to leftknovers!',
    'login.signinSuccess': 'Successfully signed in. Redirecting...',
    'login.signinFailed': 'Sign in failed',
    'login.tryAgain': 'Try again',
    
    // Home
    'home.addItem': 'Add Item',
    'home.friends': 'Friends',
    'home.totalItems': 'Total Items',
    'home.expiringSoon': 'Expiring Soon',
    'home.expired': 'Expired',
    'home.noItems': 'No food items yet',
    'home.noItemsDesc': 'Start tracking your leftovers to reduce food waste',
    'home.addFirstItem': 'Add Your First Item',
    'home.signOut': 'Sign out',
    'home.exportJson': 'Export Data (JSON)',
    'home.exportCsv': 'Export Data (CSV)',
    
    // Add Food Form
    'addFood.title': 'Add Food Item',
    'addFood.photo': 'Photo',
    'addFood.camera': 'Camera',
    'addFood.upload': 'Upload',
    'addFood.processing': 'Processing image...',
    'addFood.removePhoto': 'Remove Photo',
    'addFood.name': 'Name',
    'addFood.nameRequired': 'Name is required',
    'addFood.namePlaceholder': 'e.g., Leftover pasta',
    'addFood.description': 'Description',
    'addFood.descPlaceholder': 'e.g., Homemade marinara',
    'addFood.expiresIn': 'Expires In',
    'addFood.expiresInRequired': 'Expiration time is required',
    'addFood.days': 'days',
    'addFood.day': 'day',
    'addFood.other': 'Other',
    'addFood.enterDays': 'Enter days',
    'addFood.enterDaysDesc': 'Enter number of days (1-365)',
    'addFood.expiresOn': 'Expires on: {date}',
    'addFood.category': 'Category',
    'addFood.selectCategory': 'Select category',
    'addFood.storage': 'Storage Location',
    'addFood.selectStorage': 'Select location',
    'addFood.addItem': 'Add Item',
    'addFood.takePhoto': 'Take Photo',
    'addFood.capture': 'Capture',
    
    // Categories
    'category.leftovers': 'Leftovers',
    'category.dairy': 'Dairy',
    'category.meat': 'Meat',
    'category.vegetables': 'Vegetables',
    'category.fruits': 'Fruits',
    'category.bread': 'Bread/Bakery',
    'category.other': 'Other',
    
    // Storage
    'storage.fridge': 'Refrigerator',
    'storage.freezer': 'Freezer',
    'storage.pantry': 'Pantry',
    'storage.counter': 'Counter',
    
    // Food Item Card
    'foodCard.consumed': 'Consumed',
    'foodCard.expired': 'Expired',
    'foodCard.markConsumed': 'Mark as consumed',
    'foodCard.markExpired': 'Mark as expired',
    'foodCard.notifications': 'Notification settings',
    'foodCard.beforeExpiry': 'before expiry',
    'foodCard.expiresOn': 'Expires on {date}',
    'foodCard.expiresInDays': '{days} days left',
    'foodCard.expiresToday': 'Expires today',
    'foodCard.expiresTomorrow': 'Expires tomorrow',
    'foodCard.expiredText': 'Expired',
    
    // Alerts
    'alert.urgent': 'Urgent - Expiring Soon!',
    'alert.reminder': 'Reminder - Expiring This Week',
    
    // Settings
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.lightMode': 'Light Mode',
    'settings.darkMode': 'Dark Mode',
    'settings.english': 'English',
    'settings.french': 'Français',
    
    // Friends
    'friends.title': 'Friends',
    'friends.myFriends': 'My Friends ({count})',
    'friends.sentInvitations': 'Sent Invitations ({count})',
    'friends.inviteFriend': 'Invite Friend',
    'friends.noFriends': 'No friends yet',
    'friends.noFriendsDesc': 'Invite friends to connect and share food tracking tips!',
    'friends.inviteFirst': 'Invite Your First Friend',
    'friends.friendsSince': 'Friends since {date}',
    'friends.noInvitations': 'No invitations sent',
    'friends.noInvitationsDesc': 'Start building your food tracking community!',
    'friends.sendFirst': 'Send Your First Invitation',
    'friends.email': 'Friend\'s Email Address',
    'friends.emailPlaceholder': 'friend@example.com',
    'friends.howItWorks': 'How it works',
    'friends.step1': '• Your friend will receive an email invitation',
    'friends.step2': '• They can click the link to accept and join leftknovers',
    'friends.step3': '• You will both be connected as friends',
    'friends.step4': '• Invitations expire after 7 days',
    'friends.loadingFriends': 'Loading friends...',
    'friends.loadingInvitations': 'Loading invitations...',
    'friends.invitationSent': 'Invitation sent successfully!',
    'friends.pending': 'Pending',
    'friends.accepted': 'Accepted',
    'friends.expired': 'Expired',
    
    // Analytics
    'analytics.title': 'Analytics',
    'analytics.subtitle': 'Track your food waste reduction progress',
    'analytics.filters': 'Filters:',
    'analytics.allMonths': 'All months',
    'analytics.allCategories': 'All categories',
    'analytics.clearFilters': 'Clear filters',
    'analytics.totalItems': 'Total Items',
    'analytics.eatenBeforeExpiry': 'Eaten Before Expiry',
    'analytics.expired': 'Expired',
    'analytics.wasteRate': 'Waste Rate',
    'analytics.monthlyTrend': 'Monthly Trend',
    'analytics.overallPerformance': 'Overall Performance',
    'analytics.foodLog': 'Food Log',
    'analytics.foodLogDesc': 'Track and edit the status of your food items',
    'analytics.item': 'Item',
    'analytics.dateAdded': 'Date Added',
    'analytics.expiryDate': 'Expiry Date',
    'analytics.status': 'Status',
    'analytics.notes': 'Notes',
    'analytics.actions': 'Actions',
    'analytics.eaten': 'Eaten',
    'analytics.active': 'Active',
    'analytics.addNotes': 'Add notes...',
    'analytics.noNotes': 'No notes',
    'analytics.markEaten': 'Mark Eaten',
    'analytics.markExpired': 'Mark Expired',
    'analytics.noData': 'No data available for the selected filters',
    'analytics.loadingAnalytics': 'Loading analytics...',
    
    // Notifications
    'notification.settings': 'Notification Settings',
    'notification.enable': 'Enable Notifications',
    'notification.frequency': 'Notification Frequency',
    'notification.customMinutes': 'Custom Minutes Before Expiration',
    'notification.email': 'Notification Email Address',
    'notification.emailPlaceholder': 'Enter email address (leave blank to use account email)',
    'notification.emailDesc': 'Leave blank to use your account email address',
    'notification.preview': 'Preview',
    'notification.noNotifications': 'No notifications will be sent',
    'notification.every': 'Notify every {interval} before expiration',
    'notification.customTime': 'Notify every {time} before expiration',
    'notification.saveSettings': 'Save Settings',
    'notification.15min': '15 minutes',
    'notification.6h': '6 hours',
    'notification.12h': '12 hours',
    'notification.24h': '24 hours',
    'notification.2d': '2 days',
    'notification.3d': '3 days',
    'notification.custom': 'Custom',
    'notification.off': 'Off',
    'notification.minutes': 'minutes',
    'notification.examples': 'Examples: 15 (15 min), 60 (1 hour), 1440 (1 day), 10080 (1 week)',
  },
  fr: {
    // Common
    'app.name': 'leftknovers',
    'app.tagline': 'Suivez les restes, réduisez le gaspillage',
    'app.description': 'Suivi intelligent des restes pour réduire le gaspillage alimentaire',
    'loading': 'Chargement...',
    'error': 'Erreur',
    'success': 'Succès',
    'cancel': 'Annuler',
    'save': 'Sauvegarder',
    'delete': 'Supprimer',
    'edit': 'Modifier',
    'close': 'Fermer',
    'add': 'Ajouter',
    'send': 'Envoyer',
    'back': 'Retour',
    'next': 'Suivant',
    'done': 'Terminé',
    'yes': 'Oui',
    'no': 'Non',
    
    // Navigation
    'nav.home': 'Accueil',
    'nav.analytics': 'Analyses',
    
    // Login
    'login.title': 'Bienvenue sur leftknovers',
    'login.subtitle': 'Suivez les restes, réduisez le gaspillage, économisez de l\'argent',
    'login.signin': 'Connectez-vous à votre compte',
    'login.getStarted': 'Commencez à gérer votre inventaire alimentaire dès aujourd\'hui',
    'login.continueGoogle': 'Continuer avec Google',
    'login.whyChoose': 'Pourquoi choisir leftknovers ?',
    'login.feature1.title': 'Suivi intelligent des dates d\'expiration',
    'login.feature1.desc': 'Soyez averti avant que les aliments n\'expirent',
    'login.feature2.title': 'Reconnaissance photo',
    'login.feature2.desc': 'Prenez des photos pour ajouter rapidement des articles',
    'login.feature3.title': 'Réduire le gaspillage alimentaire',
    'login.feature3.desc': 'Économisez de l\'argent et aidez l\'environnement',
    'login.terms': 'En vous connectant, vous acceptez nos conditions d\'utilisation et notre politique de confidentialité',
    'login.completingSignin': 'Finalisation de la connexion...',
    'login.setupAccount': 'Veuillez patienter pendant que nous configurons votre compte',
    'login.welcome': 'Bienvenue sur leftknovers !',
    'login.signinSuccess': 'Connexion réussie. Redirection...',
    'login.signinFailed': 'Échec de la connexion',
    'login.tryAgain': 'Réessayer',
    
    // Home
    'home.addItem': 'Ajouter un article',
    'home.friends': 'Amis',
    'home.totalItems': 'Articles totaux',
    'home.expiringSoon': 'Expire bientôt',
    'home.expired': 'Expiré',
    'home.noItems': 'Aucun article alimentaire pour le moment',
    'home.noItemsDesc': 'Commencez à suivre vos restes pour réduire le gaspillage alimentaire',
    'home.addFirstItem': 'Ajoutez votre premier article',
    'home.signOut': 'Se déconnecter',
    'home.exportJson': 'Exporter les données (JSON)',
    'home.exportCsv': 'Exporter les données (CSV)',
    
    // Add Food Form
    'addFood.title': 'Ajouter un article alimentaire',
    'addFood.photo': 'Photo',
    'addFood.camera': 'Caméra',
    'addFood.upload': 'Télécharger',
    'addFood.processing': 'Traitement de l\'image...',
    'addFood.removePhoto': 'Supprimer la photo',
    'addFood.name': 'Nom',
    'addFood.nameRequired': 'Le nom est requis',
    'addFood.namePlaceholder': 'ex., Pâtes restantes',
    'addFood.description': 'Description',
    'addFood.descPlaceholder': 'ex., Sauce marinara maison',
    'addFood.expiresIn': 'Expire dans',
    'addFood.expiresInRequired': 'Le temps d\'expiration est requis',
    'addFood.days': 'jours',
    'addFood.day': 'jour',
    'addFood.other': 'Autre',
    'addFood.enterDays': 'Entrez les jours',
    'addFood.enterDaysDesc': 'Entrez le nombre de jours (1-365)',
    'addFood.expiresOn': 'Expire le : {date}',
    'addFood.category': 'Catégorie',
    'addFood.selectCategory': 'Sélectionner la catégorie',
    'addFood.storage': 'Lieu de stockage',
    'addFood.selectStorage': 'Sélectionner l\'emplacement',
    'addFood.addItem': 'Ajouter l\'article',
    'addFood.takePhoto': 'Prendre une photo',
    'addFood.capture': 'Capturer',
    
    // Categories
    'category.leftovers': 'Restes',
    'category.dairy': 'Produits laitiers',
    'category.meat': 'Viande',
    'category.vegetables': 'Légumes',
    'category.fruits': 'Fruits',
    'category.bread': 'Pain/Boulangerie',
    'category.other': 'Autre',
    
    // Storage
    'storage.fridge': 'Réfrigérateur',
    'storage.freezer': 'Congélateur',
    'storage.pantry': 'Garde-manger',
    'storage.counter': 'Comptoir',
    
    // Food Item Card
    'foodCard.consumed': 'Consommé',
    'foodCard.expired': 'Expiré',
    'foodCard.markConsumed': 'Marquer comme consommé',
    'foodCard.markExpired': 'Marquer comme expiré',
    'foodCard.notifications': 'Paramètres de notification',
    'foodCard.beforeExpiry': 'avant l\'expiration',
    'foodCard.expiresOn': 'Expire le {date}',
    'foodCard.expiresInDays': '{days} jours restants',
    'foodCard.expiresToday': 'Expire aujourd\'hui',
    'foodCard.expiresTomorrow': 'Expire demain',
    'foodCard.expiredText': 'Expiré',
    
    // Alerts
    'alert.urgent': 'Urgent - Expire bientôt !',
    'alert.reminder': 'Rappel - Expire cette semaine',
    
    // Settings
    'settings.title': 'Paramètres',
    'settings.language': 'Langue',
    'settings.theme': 'Thème',
    'settings.lightMode': 'Mode clair',
    'settings.darkMode': 'Mode sombre',
    'settings.english': 'English',
    'settings.french': 'Français',
    
    // Friends
    'friends.title': 'Amis',
    'friends.myFriends': 'Mes amis ({count})',
    'friends.sentInvitations': 'Invitations envoyées ({count})',
    'friends.inviteFriend': 'Inviter un ami',
    'friends.noFriends': 'Aucun ami pour le moment',
    'friends.noFriendsDesc': 'Invitez des amis pour vous connecter et partager des conseils de suivi alimentaire !',
    'friends.inviteFirst': 'Invitez votre premier ami',
    'friends.friendsSince': 'Amis depuis le {date}',
    'friends.noInvitations': 'Aucune invitation envoyée',
    'friends.noInvitationsDesc': 'Commencez à construire votre communauté de suivi alimentaire !',
    'friends.sendFirst': 'Envoyez votre première invitation',
    'friends.email': 'Adresse e-mail de l\'ami',
    'friends.emailPlaceholder': 'ami@exemple.com',
    'friends.howItWorks': 'Comment ça marche',
    'friends.step1': '• Votre ami recevra une invitation par e-mail',
    'friends.step2': '• Il peut cliquer sur le lien pour accepter et rejoindre leftknovers',
    'friends.step3': '• Vous serez tous les deux connectés comme amis',
    'friends.step4': '• Les invitations expirent après 7 jours',
    'friends.loadingFriends': 'Chargement des amis...',
    'friends.loadingInvitations': 'Chargement des invitations...',
    'friends.invitationSent': 'Invitation envoyée avec succès !',
    'friends.pending': 'En attente',
    'friends.accepted': 'Accepté',
    'friends.expired': 'Expiré',
    
    // Analytics
    'analytics.title': 'Analyses',
    'analytics.subtitle': 'Suivez vos progrès de réduction du gaspillage alimentaire',
    'analytics.filters': 'Filtres :',
    'analytics.allMonths': 'Tous les mois',
    'analytics.allCategories': 'Toutes les catégories',
    'analytics.clearFilters': 'Effacer les filtres',
    'analytics.totalItems': 'Articles totaux',
    'analytics.eatenBeforeExpiry': 'Mangé avant l\'expiration',
    'analytics.expired': 'Expiré',
    'analytics.wasteRate': 'Taux de gaspillage',
    'analytics.monthlyTrend': 'Tendance mensuelle',
    'analytics.overallPerformance': 'Performance globale',
    'analytics.foodLog': 'Journal alimentaire',
    'analytics.foodLogDesc': 'Suivez et modifiez le statut de vos articles alimentaires',
    'analytics.item': 'Article',
    'analytics.dateAdded': 'Date d\'ajout',
    'analytics.expiryDate': 'Date d\'expiration',
    'analytics.status': 'Statut',
    'analytics.notes': 'Notes',
    'analytics.actions': 'Actions',
    'analytics.eaten': 'Mangé',
    'analytics.active': 'Actif',
    'analytics.addNotes': 'Ajouter des notes...',
    'analytics.noNotes': 'Aucune note',
    'analytics.markEaten': 'Marquer comme mangé',
    'analytics.markExpired': 'Marquer comme expiré',
    'analytics.noData': 'Aucune donnée disponible pour les filtres sélectionnés',
    'analytics.loadingAnalytics': 'Chargement des analyses...',
    
    // Notifications
    'notification.settings': 'Paramètres de notification',
    'notification.enable': 'Activer les notifications',
    'notification.frequency': 'Fréquence de notification',
    'notification.customMinutes': 'Minutes personnalisées avant expiration',
    'notification.email': 'Adresse e-mail de notification',
    'notification.emailPlaceholder': 'Entrez adresse e-mail (laissez vide pour utiliser e-mail du compte)',
    'notification.emailDesc': 'Laissez vide pour utiliser adresse e-mail de votre compte',
    'notification.preview': 'Aperçu',
    'notification.noNotifications': 'Aucune notification ne sera envoyée',
    'notification.every': 'Notifier toutes les {interval} avant expiration',
    'notification.customTime': 'Notifier toutes les {time} avant expiration',
    'notification.saveSettings': 'Sauvegarder les paramètres',
    'notification.15min': '15 minutes',
    'notification.6h': '6 heures',
    'notification.12h': '12 heures',
    'notification.24h': '24 heures',
    'notification.2d': '2 jours',
    'notification.3d': '3 jours',
    'notification.custom': 'Personnalisé',
    'notification.off': 'Désactivé',
    'notification.minutes': 'minutes',
    'notification.examples': 'Exemples : 15 (15 min), 60 (1 heure), 1440 (1 jour), 10080 (1 semaine)',
  }
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('leftknovers-language');
    return (saved as Language) || 'en';
  });
  
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('leftknovers-theme');
    return (saved as Theme) || 'light';
  });

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('leftknovers-language', newLanguage);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('leftknovers-theme', newTheme);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    let text = translations[language][key] || key;
    
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(value));
      });
    }
    
    return text;
  };

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Apply language to document
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <SettingsContext.Provider value={{ language, theme, setLanguage, setTheme, t }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
