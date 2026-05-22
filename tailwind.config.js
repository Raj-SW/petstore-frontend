const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
  	extend: {
      fontFamily: {
        display: ["'Bebas Neue'", "sans-serif"],
        serif:   ["'Playfair Display'", "serif"],
        script:  ["'Great Vibes'", "cursive"],
        body:    ["'Poppins'", "sans-serif"],
        ui:      ["'Inter'", "sans-serif"],
      },
  		colors: {
        primary: {
          forest:  "#001C10",
          dark:    "#00160C",
          soft:    "#0B2016",
          DEFAULT: "#001C10",
        },
        accent: {
          gold:      "#D99A2B",
          burnished: "#A1703D",
          copper:    "#C99863",
          DEFAULT:   "#D99A2B",
        },
        bg: {
          cream:       "#FAF5F1",
          "warm-ivory":"#F6ECE3",
          "card-beige":"#F3E3D2",
          DEFAULT:     "#FAF5F1",
        },
        border: {
          taupe:   "#C9BAA8",
          DEFAULT: "#C9BAA8",
        },
        content: {
          default: "#0B2016",
          muted:   "#62573C",
          soft:    "#757060",
        },
  		},
  		keyframes: {
  			enterFromRight: {
  				from: {
  					opacity: '0',
  					transform: 'translateX(200px)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateX(0)'
  				}
  			},
  			enterFromLeft: {
  				from: {
  					opacity: '0',
  					transform: 'translateX(-200px)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateX(0)'
  				}
  			},
  			exitToRight: {
  				from: {
  					opacity: '1',
  					transform: 'translateX(0)'
  				},
  				to: {
  					opacity: '0',
  					transform: 'translateX(200px)'
  				}
  			},
  			exitToLeft: {
  				from: {
  					opacity: '1',
  					transform: 'translateX(0)'
  				},
  				to: {
  					opacity: '0',
  					transform: 'translateX(-200px)'
  				}
  			},
  			scaleIn: {
  				from: {
  					opacity: '0',
  					transform: 'rotateX(-10deg) scale(0.9)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'rotateX(0deg) scale(1)'
  				}
  			},
  			scaleOut: {
  				from: {
  					opacity: '1',
  					transform: 'rotateX(0deg) scale(1)'
  				},
  				to: {
  					opacity: '0',
  					transform: 'rotateX(-10deg) scale(0.95)'
  				}
  			},
  			fadeIn: {
  				from: {
  					opacity: '0'
  				},
  				to: {
  					opacity: '1'
  				}
  			},
  			fadeOut: {
  				from: {
  					opacity: '1'
  				},
  				to: {
  					opacity: '0'
  				}
  			},
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	},
  	animation: {
  		scaleIn: 'scaleIn 200ms ease',
  		scaleOut: 'scaleOut 200ms ease',
  		fadeIn: 'fadeIn 200ms ease',
  		fadeOut: 'fadeOut 200ms ease',
  		enterFromLeft: 'enterFromLeft 250ms ease',
  		enterFromRight: 'enterFromRight 250ms ease',
  		exitToLeft: 'exitToLeft 250ms ease',
  		exitToRight: 'exitToRight 250ms ease'
  	}
  },
  plugins: [
    plugin(({ matchUtilities }) => {
      matchUtilities({
        perspective: (value) => ({
          perspective: value,
        }),
      });
    }),
  ],
};
