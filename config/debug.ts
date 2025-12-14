// Configurações de Debug
export const DEBUG_CONFIG = {
  // Para mostrar o painel de debug, defina como true
  // Para ocultar o painel de debug, defina como false
  SHOW_DEBUG_PANEL: false,
  
  // Para mostrar logs detalhados no console
  VERBOSE_LOGGING: false,
  
  // Para mostrar informações de performance
  SHOW_PERFORMANCE_INFO: false,
}

// Função para verificar se deve mostrar o debug
export const shouldShowDebug = () => {
  // Em desenvolvimento, sempre mostrar se configurado
  if (process.env.NODE_ENV === 'development') {
    return DEBUG_CONFIG.SHOW_DEBUG_PANEL
  }
  
  // Em produção, nunca mostrar
  return false
}
