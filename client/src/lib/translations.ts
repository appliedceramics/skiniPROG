export interface Translation {
  // App branding
  appName: string;
  appSubtitle: string;
  
  // Navigation
  myFiles: string;
  settings: string;
  
  // Actions
  upload: string;
  newFolder: string;
  download: string;
  selectAll: string;
  cancel: string;
  create: string;
  save: string;
  
  // Search
  searchPlaceholder: string;
  
  // File management
  noFilesFound: string;
  noFilesDescription: string;
  selectShare: string;
  selectShareDescription: string;
  folderCreated: string;
  
  // Settings page
  settingsTitle: string;
  settingsDescription: string;
  language: string;
  defaultMyFilesLocation: string;
  defaultMyFilesDescription: string;
  
  // Password dialogs
  adminAccessRequired: string;
  adminAccessDescription: string;
  managerAccessRequired: string;
  uploadFilesAction: string;
  createFoldersAction: string;
  selectAllFilesAction: string;
  selectFoldersAction: string;
  
  // Dialog titles
  newDirectoryTitle: string;
  newDirectoryDescription: string;
  folderNamePlaceholder: string;
  
  // Messages
  connected: string;
  connectionFailed: string;
  settingsSaved: string;
  settingsSavedDescription: string;
  
  // Footer
  productOf: string;
  
  // File sizes and counts
  items: string;
  
  // Status messages
  uploading: string;
  creating: string;
  
  // Password dialog
  password: string;
  enterPassword: string;
  submit: string;
  incorrectPassword: string;
  adminAccessRequired: string;
  adminAccessDescription: string;
  managerAccessRequired: string;
  uploadFilesAction: string;
  createFoldersAction: string;
  selectAllFilesAction: string;
  selectFoldersAction: string;
}

export const translations: Record<string, Translation> = {
  en: {
    // App branding
    appName: "skiniPROG",
    appSubtitle: "CNC Program Fetcher",
    
    // Navigation
    myFiles: "My Files",
    settings: "Settings",
    
    // Actions
    upload: "Upload",
    newFolder: "New Folder",
    download: "Download",
    selectAll: "Select all",
    cancel: "CANCEL",
    create: "CREATE",
    save: "SAVE",
    
    // Search
    searchPlaceholder: "Search files and folders...",
    
    // File management
    noFilesFound: "No files found",
    noFilesDescription: "This folder is empty or no files match your search",
    selectShare: "Select a share",
    selectShareDescription: "Choose an SMB share from the sidebar to browse files",
    folderCreated: "Folder Created",
    
    // Settings page
    settingsTitle: "Settings",
    settingsDescription: "Configure your file browser preferences",
    language: "Language",
    defaultMyFilesLocation: "Default \"My Files\" Location",
    defaultMyFilesDescription: "This path will be used as the default location for \"My Files\" section",
    
    // Password dialogs
    adminAccessRequired: "Administrator Access Required",
    adminAccessDescription: "Enter the administrator password to access Settings.",
    managerAccessRequired: "Manager Authorization Required",
    uploadFilesAction: "upload files",
    createFoldersAction: "create new folders",
    selectAllFilesAction: "select all files",
    selectFoldersAction: "select folders",
    
    // Dialog titles
    newDirectoryTitle: "New directory",
    newDirectoryDescription: "Write the name of the new directory",
    folderNamePlaceholder: "Folder name",
    
    // Messages
    connected: "Connected",
    connectionFailed: "Connection Failed",
    settingsSaved: "Settings Saved",
    settingsSavedDescription: "Default My Files path set to:",
    
    // Footer
    productOf: "Product of Motava Corporation | www.motava.com",
    
    // File sizes and counts
    items: "items",
    
    // Status messages
    uploading: "Uploading...",
    creating: "Creating...",
    
    // Password dialog
    password: "Password",
    enterPassword: "Enter password",
    submit: "Submit",
    incorrectPassword: "Incorrect password. Please try again.",
    adminAccessRequired: "Administrator Access Required",
    adminAccessDescription: "Enter the administrator password to access Settings.",
    managerAccessRequired: "Manager Authorization Required",
    uploadFilesAction: "upload files",
    createFoldersAction: "create new folders",
    selectAllFilesAction: "select all files",
    selectFoldersAction: "select folders",
  },
  
  hr: {
    // App branding
    appName: "skiniPROG",
    appSubtitle: "CNC Preuzimatelj Programa",
    
    // Navigation
    myFiles: "Moje Datoteke",
    settings: "Postavke",
    
    // Actions
    upload: "Učitaj",
    newFolder: "Nova Mapa",
    download: "Preuzmi",
    selectAll: "Odaberi sve",
    cancel: "OTKAŽI",
    create: "STVORI",
    save: "SPREMI",
    
    // Search
    searchPlaceholder: "Pretraži datoteke i mape...",
    
    // File management
    noFilesFound: "Nema pronađenih datoteka",
    noFilesDescription: "Ova mapa je prazna ili nema datoteka koje odgovaraju vašoj pretrazi",
    selectShare: "Odaberite dijeljeni resurs",
    selectShareDescription: "Odaberite SMB dijeljeni resurs iz bočne trake za pregledavanje datoteka",
    folderCreated: "Mapa Stvorena",
    
    // Settings page
    settingsTitle: "Postavke",
    settingsDescription: "Konfigurirajte vaše postavke preglednika datoteka",
    language: "Jezik",
    defaultMyFilesLocation: "Zadana lokacija \"Moje Datoteke\"",
    defaultMyFilesDescription: "Ovaj put će se koristiti kao zadana lokacija za odjeljak \"Moje Datoteke\"",
    
    // Password dialogs
    adminAccessRequired: "Potreban je Administratorski Pristup",
    adminAccessDescription: "Unesite administratorsku lozinku za pristup Postavkama.",
    managerAccessRequired: "Potrebna je Odobrenje Upravitelja",
    uploadFilesAction: "učitavanje datoteka",
    createFoldersAction: "stvaranje novih mapa",
    selectAllFilesAction: "odabir svih datoteka",
    selectFoldersAction: "odabir mapa",
    
    // Dialog titles
    newDirectoryTitle: "Novi direktorij",
    newDirectoryDescription: "Upišite naziv novog direktorija",
    folderNamePlaceholder: "Naziv mape",
    
    // Messages
    connected: "Povezano",
    connectionFailed: "Neuspješno Povezivanje",
    settingsSaved: "Postavke Spremljene",
    settingsSavedDescription: "Zadani put za Moje Datoteke postavljen na:",
    
    // Footer
    productOf: "Proizvod Motava Corporation | www.motava.com",
    
    // File sizes and counts
    items: "stavki",
    
    // Status messages
    uploading: "Učitavanje...",
    creating: "Stvaranje...",
    
    // Password dialog
    password: "Lozinka",
    enterPassword: "Unesite lozinku",
    submit: "Potvrdi",
    incorrectPassword: "Netočna lozinka. Molimo pokušajte ponovo.",
    adminAccessRequired: "Potreban administratorski pristup",
    adminAccessDescription: "Unesite administratorsku lozinku za pristup Postavkama.",
    managerAccessRequired: "Potrebna autorizacija voditelja",
    uploadFilesAction: "učitati datoteke",
    createFoldersAction: "stvoriti nove mape",
    selectAllFilesAction: "odabrati sve datoteke",
    selectFoldersAction: "odabrati mape",
  }
};

export const getTranslation = (language: string): Translation => {
  return translations[language] || translations.en;
};