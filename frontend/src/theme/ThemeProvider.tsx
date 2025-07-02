/**
 * ThemeProvider.tsx
 * 负责创建并提供MUI主题，处理主题切换逻辑
 */
import { ReactNode, useEffect, useState } from 'react'
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { useColorMode } from '../stores/theme'
import {
  getCurrentTheme,
  UI_STYLES,
  getCurrentBackground,
  getCurrentExtendedPalette,
} from './themeConfig'
import { BORDER_RADIUS } from './variants'
import { getMuiPaletteOptions, getAlphaColor } from './palette'
import { getBackdropFilter, getShadow } from './themeApi'

// 导入高级渐变系统和初始化函数
import { registerHoudiniPaints } from './gradients'

// 定义全局字体
const FONT_PRIMARY = `'Inter', 'Open Sans', sans-serif`

/**
 * Material UI主题提供者
 * 根据当前主题模式创建并应用主题，处理系统主题变化
 */
export default function ThemeProvider({ children }: { children: ReactNode }) {
  const { getEffectiveMode, performanceMode } = useColorMode()
  const effectiveMode = getEffectiveMode()
  const currentTheme = getCurrentTheme()
  const currentBackground = getCurrentBackground()
  const extendedPalette = getCurrentExtendedPalette()

  // 状态跟踪，用于强制重新渲染
  const [, forceUpdate] = useState({})

  // 初始化CSS Houdini Paint API (如果浏览器支持)
  useEffect(() => {
    // 注册高级渐变的Houdini Paint Worklet
    registerHoudiniPaints()
  }, [])

  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = () => {
      // 触发重新渲染 (由于 useEffect 会在依赖变化时重新运行，这里不需要额外操作)
    }

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      // 兼容旧版浏览器
      mediaQuery.addListener?.(handleChange)
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange)
      } else {
        // 兼容旧版浏览器
        mediaQuery.removeListener?.(handleChange)
      }
    }
  }, [])

  // 监听主题变化事件
  useEffect(() => {
    const handleThemeChange = () => {
      // 强制组件重新渲染
      forceUpdate({})
    }

    window.addEventListener('nekro-theme-change', handleThemeChange)

    return () => {
      window.removeEventListener('nekro-theme-change', handleThemeChange)
    }
  }, [])

  // 添加性能模式CSS类，用于全局控制视觉效果
  useEffect(() => {
    // 移除所有性能模式类
    document.documentElement.classList.remove(
      'performance-mode-quality',
      'performance-mode-balanced',
      'performance-mode-performance'
    )

    // 添加当前性能模式类
    document.documentElement.classList.add(`performance-mode-${performanceMode}`)

    // 设置CSS变量用于控制动画和过渡效果
    if (performanceMode === 'performance') {
      document.documentElement.style.setProperty('--nekro-transition-duration', '0s')
      document.documentElement.style.setProperty('--nekro-animation-duration', '0s')
      document.documentElement.style.setProperty('--nekro-blur-effect', '0px')
    } else if (performanceMode === 'balanced') {
      document.documentElement.style.setProperty('--nekro-transition-duration', '0.2s')
      document.documentElement.style.setProperty('--nekro-animation-duration', '0.3s')
      document.documentElement.style.setProperty('--nekro-blur-effect', '6px')
    } else {
      document.documentElement.style.setProperty('--nekro-transition-duration', '0.3s')
      document.documentElement.style.setProperty('--nekro-animation-duration', '0.5s')
      document.documentElement.style.setProperty('--nekro-blur-effect', '12px')
    }

    // 发送性能模式变更事件
    const perfModeEvent = new CustomEvent('nekro-performance-change', {
      detail: { performanceMode },
    })
    window.dispatchEvent(perfModeEvent)
  }, [performanceMode])

  // 创建 MUI 主题
  const muiTheme = createTheme({
    // 调色板配置
    palette: getMuiPaletteOptions(effectiveMode, currentTheme),

    // 字体设置
    typography: {
      fontFamily: FONT_PRIMARY,
      button: {
        fontWeight: 600,
        letterSpacing: '0.02em',
      },
      h1: {
        fontWeight: 700,
        fontSize: '2.5rem',
        lineHeight: 1.3,
      },
      h2: {
        fontWeight: 700,
        fontSize: '2rem',
        lineHeight: 1.35,
      },
      h3: {
        fontWeight: 700,
        fontSize: '1.7rem',
        lineHeight: 1.4,
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.5rem',
        lineHeight: 1.45,
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.25rem',
        lineHeight: 1.5,
      },
      h6: {
        fontWeight: 600,
        fontSize: '1.1rem',
        lineHeight: 1.55,
      },
      subtitle1: {
        fontWeight: 500,
        fontSize: '0.95rem',
        lineHeight: 1.6,
      },
      subtitle2: {
        fontWeight: 500,
        fontSize: '0.85rem',
        lineHeight: 1.6,
      },
      body1: {
        fontWeight: 400,
        fontSize: '0.95rem',
        lineHeight: 1.6,
      },
      body2: {
        fontWeight: 400,
        fontSize: '0.85rem',
        lineHeight: 1.6,
      },
      caption: {
        fontWeight: 400,
        fontSize: '0.75rem',
        lineHeight: 1.4,
      },
    },

    // 组件样式定制
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: UI_STYLES.getGradient('primary'),
            boxShadow: getShadow(UI_STYLES.getShadow('medium')),
            borderBottom: effectiveMode === 'dark' ? UI_STYLES.getBorder() : 'none',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backdropFilter: getBackdropFilter('blur(12px)'),
            WebkitBackdropFilter: getBackdropFilter('blur(12px)'),
            boxShadow: getShadow(
              `0 0 25px rgba(0, 0, 0, ${effectiveMode === 'dark' ? 0.35 : 0.1}), 0 0 10px ${getAlphaColor(extendedPalette.primary.main, effectiveMode === 'dark' ? 0.12 : 0.05)}`
            ),
            borderRight: '1px solid',
            borderRightColor:
              effectiveMode === 'dark'
                ? getAlphaColor(extendedPalette.primary.main, 0.12)
                : getAlphaColor(extendedPalette.primary.main, 0.06),
          },
        },
      },
      MuiPaper: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            borderRadius: BORDER_RADIUS.DEFAULT,
            transition: 'all 0.3s ease',
            border: `1px solid ${getAlphaColor(extendedPalette.primary.main, effectiveMode === 'dark' ? 0.08 : 0.04)}`,
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: getAlphaColor(extendedPalette.primary.main, 0.08),
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: `1px solid ${getAlphaColor(extendedPalette.primary.main, effectiveMode === 'dark' ? 0.15 : 0.08)}`,
            boxShadow: `0 10px 30px rgba(0, 0, 0, ${effectiveMode === 'dark' ? 0.35 : 0.15}), 0 0 10px ${getAlphaColor(extendedPalette.primary.main, effectiveMode === 'dark' ? 0.12 : 0.05)}`,
            overflow: 'hidden',
          },
        },
      },
      MuiLink: {
        defaultProps: {
          underline: 'hover',
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          html: {
            scrollBehavior: 'smooth',
          },
          body: {
            minHeight: '100vh',
            transition: 'background-color 0.3s ease',
            background: UI_STYLES.getGradient('background'),
            backgroundColor: effectiveMode === 'dark' ? '#181818' : '#f8f8f8',
          },
          '*::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '*::-webkit-scrollbar-track': {
            background:
              effectiveMode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
            borderRadius: '3px',
          },
          '*::-webkit-scrollbar-thumb': {
            background:
              effectiveMode === 'dark' ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.18)',
            borderRadius: '3px',
            '&:hover': {
              background:
                effectiveMode === 'dark' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.25)',
            },
          },
          '*': {
            scrollbarWidth: 'thin',
            scrollbarColor: `${effectiveMode === 'dark' ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.18)'} 
            ${effectiveMode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'}`,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            boxShadow: 'none',
            fontWeight: 600,
            textTransform: 'none',
            transition: 'all 0.2s ease',
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color:
              effectiveMode === 'dark'
                ? getAlphaColor(extendedPalette.primary.lighter, 0.85)
                : extendedPalette.primary.main,
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            boxShadow: `0 0 8px ${extendedPalette.primary.main}`,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor:
              effectiveMode === 'light'
                ? getAlphaColor('#ffffff', 0.95)
                : getAlphaColor(currentBackground.paper, 0.95),
            color: effectiveMode === 'light' ? 'rgba(0, 0, 0, 0.87)' : 'rgba(255, 255, 255, 0.92)',
            borderRadius: BORDER_RADIUS.DEFAULT,
            boxShadow:
              effectiveMode === 'light'
                ? '0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)'
                : '0 4px 20px rgba(0, 0, 0, 0.25), 0 2px 8px rgba(0, 0, 0, 0.15)',
            border:
              effectiveMode === 'light'
                ? 'rgba(0, 0, 0, 0.08)'
                : `1px solid ${getAlphaColor(extendedPalette.primary.main, 0.15)}`,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            fontSize: '0.75rem',
            lineHeight: 1.4,
            padding: '8px 12px',
            fontWeight: 500,
          },
          arrow: {
            color:
              effectiveMode === 'light'
                ? getAlphaColor('#ffffff', 0.95)
                : getAlphaColor(currentBackground.paper, 0.95),
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: 'action.hover',
            },
            '&:nth-of-type(odd)': {
              backgroundColor:
                effectiveMode === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.03)',
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${effectiveMode === 'dark' ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)'}`,
            transition: 'background-color 0.15s ease',
            padding: '12px 16px',
          },
          head: {
            fontWeight: 600,
            backgroundColor:
              effectiveMode === 'light'
                ? 'rgba(245, 245, 245, 0.95)'
                : getAlphaColor(extendedPalette.primary.darker, 0.6),
            color: effectiveMode === 'dark' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.85)',
            transition: 'background-color 0.15s ease',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            boxShadow:
              effectiveMode === 'dark'
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.15)'
                : '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: BORDER_RADIUS.DEFAULT,
            backdropFilter: getBackdropFilter('blur(12px) saturate(1.2)'),
            WebkitBackdropFilter: getBackdropFilter('blur(12px) saturate(1.2)'),
            backgroundColor:
              effectiveMode === 'dark' ? 'rgba(47, 47, 47, 0.8)' : 'rgba(255, 255, 255, 0.85)',
            border: '1px solid',
            borderColor:
              effectiveMode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
            boxShadow: getShadow('0 4px 20px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05)'),
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',

            // 内容文本样式
            '& .MuiAlert-message': {
              fontSize: '0.875rem',
              fontWeight: 500,
              lineHeight: 1.5,
              textShadow:
                effectiveMode === 'dark'
                  ? '0 1px 2px rgba(0, 0, 0, 0.4)'
                  : '0 1px 2px rgba(255, 255, 255, 0.8)',
            },

            // 图标样式
            '& .MuiAlert-icon': {
              opacity: 0.9,
              filter:
                effectiveMode === 'dark'
                  ? 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.4))'
                  : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
            },

            // 操作按钮样式
            '& .MuiAlert-action': {
              '& .MuiIconButton-root': {
                backdropFilter: getBackdropFilter('blur(8px)'),
                borderRadius: BORDER_RADIUS.SMALL,
                transition: 'all 0.15s ease',
                '&:hover': {
                  backgroundColor:
                    effectiveMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                },
              },
            },

            // 顶部装饰线
            '&:before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background:
                effectiveMode === 'dark'
                  ? 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)'
                  : 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
              zIndex: 1,
            },
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            backgroundColor: getAlphaColor(currentBackground.paper, 0.85),
            boxShadow: `0 4px 20px rgba(0, 0, 0, ${effectiveMode === 'dark' ? 0.3 : 0.12}), 0 0 10px ${getAlphaColor(extendedPalette.primary.main, effectiveMode === 'dark' ? 0.1 : 0.05)}`,
            border: `1px solid ${getAlphaColor(extendedPalette.primary.main, effectiveMode === 'dark' ? 0.12 : 0.06)}`,
            '& .MuiMenuItem-root': {
              transition: 'background-color 0.2s ease',
            },
          },
        },
      },
      MuiPopover: {
        styleOverrides: {
          paper: {
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            backgroundColor: getAlphaColor(currentBackground.paper, 0.85),
            boxShadow: `0 4px 20px rgba(0, 0, 0, ${effectiveMode === 'dark' ? 0.3 : 0.12}), 0 0 10px ${getAlphaColor(extendedPalette.primary.main, effectiveMode === 'dark' ? 0.1 : 0.05)}`,
            border: `1px solid ${getAlphaColor(extendedPalette.primary.main, effectiveMode === 'dark' ? 0.12 : 0.06)}`,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backdropFilter: getBackdropFilter('blur(8px)'),
              WebkitBackdropFilter: getBackdropFilter('blur(8px)'),
              backgroundColor:
                effectiveMode === 'dark'
                  ? getAlphaColor(currentBackground.paper, 0.4)
                  : getAlphaColor('#ffffff', 0.7),
              transition: 'all 0.2s ease',
              borderRadius: BORDER_RADIUS.DEFAULT,

              '& fieldset': {
                borderColor:
                  effectiveMode === 'dark'
                    ? getAlphaColor(extendedPalette.primary.main, 0.2)
                    : getAlphaColor(extendedPalette.primary.main, 0.15),
                borderWidth: '1px',
                transition: 'all 0.2s ease',
              },

              '&:hover': {
                backgroundColor:
                  effectiveMode === 'dark'
                    ? getAlphaColor(currentBackground.paper, 0.5)
                    : getAlphaColor('#ffffff', 0.8),
                '& fieldset': {
                  borderColor:
                    effectiveMode === 'dark'
                      ? getAlphaColor(extendedPalette.primary.main, 0.3)
                      : getAlphaColor(extendedPalette.primary.main, 0.25),
                  boxShadow: `0 0 0 1px ${getAlphaColor(extendedPalette.primary.main, 0.1)}`,
                },
              },

              '&.Mui-focused': {
                backgroundColor:
                  effectiveMode === 'dark'
                    ? getAlphaColor(currentBackground.paper, 0.6)
                    : getAlphaColor('#ffffff', 0.9),
                boxShadow: `0 0 0 2px ${getAlphaColor(extendedPalette.primary.main, 0.2)}, 0 4px 12px ${getAlphaColor(extendedPalette.primary.main, 0.1)}`,
                '& fieldset': {
                  borderColor: extendedPalette.primary.main,
                  borderWidth: '2px',
                },
              },

              '&.Mui-error': {
                backgroundColor:
                  effectiveMode === 'dark'
                    ? getAlphaColor('#ff5252', 0.1)
                    : getAlphaColor('#ffebee', 0.8),
                '& fieldset': {
                  borderColor: '#ff5252',
                },
              },

              '&.Mui-disabled': {
                backgroundColor:
                  effectiveMode === 'dark'
                    ? getAlphaColor(currentBackground.paper, 0.2)
                    : getAlphaColor('#f5f5f5', 0.7),
                '& fieldset': {
                  borderColor:
                    effectiveMode === 'dark'
                      ? getAlphaColor(extendedPalette.primary.main, 0.1)
                      : getAlphaColor(extendedPalette.primary.main, 0.08),
                },
              },
            },

            // 输入文本样式
            '& .MuiOutlinedInput-input': {
              color: effectiveMode === 'dark' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.87)',
              fontSize: '0.95rem',
              fontWeight: 400,
              '&::placeholder': {
                color: effectiveMode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
                opacity: 1,
              },
            },

            // 标签样式
            '& .MuiInputLabel-root': {
              color: effectiveMode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
              fontSize: '0.9rem',
              fontWeight: 500,

              '&.Mui-focused': {
                color: extendedPalette.primary.main,
                fontWeight: 600,
              },

              '&.Mui-error': {
                color: '#ff5252',
              },
            },

            // 辅助文本样式
            '& .MuiFormHelperText-root': {
              fontSize: '0.75rem',
              marginTop: '6px',
              color: effectiveMode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',

              '&.Mui-error': {
                color: '#ff5252',
              },
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backdropFilter: getBackdropFilter('blur(8px)'),
            WebkitBackdropFilter: getBackdropFilter('blur(8px)'),
            backgroundColor:
              effectiveMode === 'dark'
                ? getAlphaColor(currentBackground.paper, 0.4)
                : getAlphaColor('#ffffff', 0.7),
            borderRadius: BORDER_RADIUS.DEFAULT,

            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor:
                effectiveMode === 'dark'
                  ? getAlphaColor(extendedPalette.primary.main, 0.3)
                  : getAlphaColor(extendedPalette.primary.main, 0.25),
            },

            '&.Mui-focused': {
              backgroundColor:
                effectiveMode === 'dark'
                  ? getAlphaColor(currentBackground.paper, 0.6)
                  : getAlphaColor('#ffffff', 0.9),
              boxShadow: `0 0 0 2px ${getAlphaColor(extendedPalette.primary.main, 0.2)}`,
            },
          },
          notchedOutline: {
            borderColor:
              effectiveMode === 'dark'
                ? getAlphaColor(extendedPalette.primary.main, 0.2)
                : getAlphaColor(extendedPalette.primary.main, 0.15),
            transition: 'all 0.2s ease',
          },
        },
      },
      MuiFilledInput: {
        styleOverrides: {
          root: {
            backdropFilter: getBackdropFilter('blur(8px)'),
            WebkitBackdropFilter: getBackdropFilter('blur(8px)'),
            backgroundColor:
              effectiveMode === 'dark'
                ? getAlphaColor(currentBackground.paper, 0.3)
                : getAlphaColor('#f5f5f5', 0.8),
            borderRadius: `${BORDER_RADIUS.DEFAULT} ${BORDER_RADIUS.DEFAULT} 0 0`,
            border: `1px solid ${
              effectiveMode === 'dark'
                ? getAlphaColor(extendedPalette.primary.main, 0.15)
                : getAlphaColor(extendedPalette.primary.main, 0.1)
            }`,
            borderBottom: `2px solid ${
              effectiveMode === 'dark'
                ? getAlphaColor(extendedPalette.primary.main, 0.2)
                : getAlphaColor(extendedPalette.primary.main, 0.15)
            }`,

            '&:before': {
              display: 'none',
            },

            '&:after': {
              display: 'none',
            },

            '&:hover': {
              backgroundColor:
                effectiveMode === 'dark'
                  ? getAlphaColor(currentBackground.paper, 0.4)
                  : getAlphaColor('#f5f5f5', 0.9),
            },

            '&.Mui-focused': {
              backgroundColor:
                effectiveMode === 'dark'
                  ? getAlphaColor(currentBackground.paper, 0.5)
                  : getAlphaColor('#ffffff', 0.9),
              borderBottomColor: extendedPalette.primary.main,
              boxShadow: `0 2px 8px ${getAlphaColor(extendedPalette.primary.main, 0.2)}`,
            },
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          input: {
            color: effectiveMode === 'dark' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.87)',
            fontSize: '0.95rem',
            fontWeight: 400,

            '&::placeholder': {
              color: effectiveMode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
              opacity: 1,
            },

            '&::-webkit-input-placeholder': {
              color: effectiveMode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
              opacity: 1,
            },

            '&::-moz-placeholder': {
              color: effectiveMode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
              opacity: 1,
            },
          },
        },
      },
    },
  })

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  )
}
