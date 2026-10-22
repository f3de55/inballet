declare module 'astro:env/client' {
	export const PUBLIC_GOOGLE_MAPS_KEY: string;	
	export const PUBLIC_GOOGLE_PLACE_ID: string;	
}declare module 'astro:env/server' {
	export const CHATBOT_MODELLI: string;	
	export const CHATBOT_GRATUITI: string;	
	export const CHATBOT_BUDGET_GIORNO: number;	
	export const CHATBOT_IP_HEADER: string | undefined;	
	export const ANTHROPIC_API_KEY: string | undefined;	
	export const GEMINI_API_KEY: string | undefined;	
	export const MISTRAL_API_KEY: string | undefined;	
	export const GROQ_API_KEY: string | undefined;	
	export const OPENROUTER_API_KEY: string | undefined;	
	export const OPENAI_API_KEY: string | undefined;	
	export const CEREBRAS_API_KEY: string | undefined;	
	export const CHATBOT_COMPATIBILE_URL: string | undefined;	
	export const CHATBOT_COMPATIBILE_KEY: string | undefined;	
	export const DASHBOARD_PASSWORD: string | undefined;	
	export const DATA_DIR: string;	
}