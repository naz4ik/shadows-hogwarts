 {/* ТИпи для dialogs.ts і тд. */}

export interface DialogueOption {
    text: string;
    nextSceneId: string;
    condition?: (importantChoices: Set<string>) => boolean;
    importantChoice?: string;
  }
  
  
  export interface DialogueScene {
    id: string;
    text: string;
    next?: string;
    options?: DialogueOption[];
    backgroundImage?: string;
    backgroundColor?: string;
    personageImage?: string;
    canGoBack?: boolean;
    personageName?: string;
    condition?: (importantChoices: Set<string>) => boolean;
    resetHistory?: boolean;
    music?: string;
  }
  
  