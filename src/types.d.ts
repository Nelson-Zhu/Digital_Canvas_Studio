declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare module 'react' {
  const React: {
    createElement: any;
    Fragment: any;
    StrictMode: any;
  };
  export default React;
  
  export function createContext<T>(defaultValue: T): any;
  export function useContext<T>(context: any): T;
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useRef<T>(initialValue: T): { current: T };
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
}

declare module 'react-dom/client' {
  export function createRoot(container: Element | null): { render(element: any): void };
}

declare module 'react-router-dom' {
  export const BrowserRouter: any;
  export const Routes: any;
  export const Route: any;
}

declare module 'firebase/app' {
  export function initializeApp(config: any): any;
}

declare module 'firebase/auth' {
  export function getAuth(app: any): any;
}

declare module 'firebase/firestore' {
  export function getFirestore(app: any): any;
}

declare module 'firebase/storage' {
  export function getStorage(app: any): any;
}

// Adding declarations for Vite and path modules
declare module 'vite' {
  export function defineConfig(config: any): any;
}

declare module '@vitejs/plugin-react' {
  const plugin: any;
  export default plugin;
}

declare module 'path' {
  export function resolve(...paths: string[]): string;
}

declare module 'react/jsx-runtime' {
  export namespace JSX {
    interface Element {}
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
  export function jsx(type: any, props: any, key?: string): any;
  export function jsxs(type: any, props: any, key?: string): any;
}

declare module './App' {
  const App: React.ComponentType;
  export default App;
} 