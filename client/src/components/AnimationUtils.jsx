import React from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';

// Fade in animation
export const FadeIn = ({ children, delay = 0, duration = 0.5, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Slide in animations
export const SlideInRight = ({ children, delay = 0, duration = 0.5, className = '' }) => {
  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const SlideInLeft = ({ children, delay = 0, duration = 0.5, className = '' }) => {
  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const SlideInUp = ({ children, delay = 0, duration = 0.5, className = '' }) => {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const SlideInDown = ({ children, delay = 0, duration = 0.5, className = '' }) => {
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 3D Card Effect
export const Card3D = ({ children, className = '', intensity = 10 }) => {
  const [rotateX, setRotateX] = React.useState(0);
  const [rotateY, setRotateY] = React.useState(0);
  const [scale, setScale] = React.useState(1);
  
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element
    const y = e.clientY - rect.top; // y position within the element
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateYValue = ((x - centerX) / centerX) * intensity;
    const rotateXValue = ((y - centerY) / centerY) * -intensity;
    
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };
  
  const handleMouseEnter = () => {
    setScale(1.03);
  };
  
  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setScale(1);
  };
  
  return (
    <motion.div
      className={`perspective-1000 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX, rotateY, scale }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </motion.div>
  );
};

// Morphing Blob Animation
export const MorphingBlob = ({ 
  className = '', 
  color = 'bg-cyan-500', 
  size = 'w-32 h-32', 
  opacity = 'opacity-70',
  blur = 'blur-xl'
}) => {
  return (
    <div className={`absolute ${className}`}>
      <div className={`${size} ${color} ${opacity} filter ${blur} animate-morph`}></div>
    </div>
  );
};

// Glowing Text
export const GlowingText = ({ children, className = '', color = 'text-cyan-400', glowColor = 'cyan' }) => {
  return (
    <span className={`${color} ${className} relative inline-block`}>
      <span className={`absolute inset-0 blur-sm opacity-70 animate-pulse text-${glowColor}-400`}>{children}</span>
      <span className="relative">{children}</span>
    </span>
  );
};

// Shimmering Border
export const ShimmeringBorder = ({ children, className = '', colors = 'from-cyan-400 via-blue-500 to-purple-600' }) => {
  return (
    <div className={`relative p-0.5 overflow-hidden rounded-lg ${className}`}>
      <div className={`absolute inset-0 bg-gradient-to-r ${colors} animate-gradient-shift`}></div>
      <div className="relative bg-card rounded-lg p-4">
        {children}
      </div>
    </div>
  );
};

// Floating Element
export const FloatingElement = ({ children, className = '', intensity = 'animate-float' }) => {
  return (
    <motion.div className={`${className} ${intensity}`}>
      {children}
    </motion.div>
  );
};

// Parallax Effect
export const ParallaxLayer = ({ children, depth = 0.2, className = '' }) => {
  const [offsetY, setOffsetY] = React.useState(0);
  const handleScroll = () => setOffsetY(window.pageYOffset);
  
  React.useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <motion.div
      className={className}
      style={{ y: offsetY * depth }}
    >
      {children}
    </motion.div>
  );
};

// Gradient Background with Animation
export const GradientBackground = ({ 
  className = '', 
  gradient = 'from-cyan-500 via-blue-600 to-purple-600',
  size = 'w-full h-full'
}) => {
  return (
    <div className={`absolute ${size} ${className} bg-gradient-to-r ${gradient} bg-[length:200%_200%] animate-gradient-shift -z-10`}></div>
  );
};

// Neo-Brutalist Button
export const NeoButton = ({ 
  children, 
  className = '', 
  color = 'bg-cyan-500',
  shadowColor = 'shadow-neo-brutal',
  onClick 
}) => {
  return (
    <motion.button
      className={`${color} ${shadowColor} px-6 py-3 font-bold transition-all ${className}`}
      whileHover={{ translateY: -2 }}
      whileTap={{ translateY: 2 }}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
};

// Glass Card
export const GlassCard = ({ children, className = '', hoverEffect = true }) => {
  return (
    <motion.div 
      className={`backdrop-blur-md bg-white/10 rounded-lg border border-white/20 shadow-glass ${className}`}
      whileHover={hoverEffect ? { scale: 1.02 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      {children}
    </motion.div>
  );
};

// Ripple Effect Button
export const RippleButton = ({ 
  children, 
  className = '', 
  color = 'bg-cyan-500',
  onClick 
}) => {
  return (
    <motion.button
      className={`${color} rounded-lg px-6 py-3 font-bold overflow-hidden relative ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <span className="relative z-10">{children}</span>
      <span className="absolute inset-0 bg-white/20 animate-ripple rounded-lg"></span>
    </motion.button>
  );
};

// Animated Count Number
export const AnimatedCounter = ({ value, duration = 2, className = '', prefix = '', suffix = '' }) => {
  const controls = useAnimation();
  const [displayValue, setDisplayValue] = React.useState(0);
  
  React.useEffect(() => {
    let startValue = 0;
    const step = Math.max(1, Math.floor(value / (duration * 30))); // 30fps
    
    const counter = setInterval(() => {
      startValue += step;
      if (startValue > value) {
        setDisplayValue(value);
        clearInterval(counter);
      } else {
        setDisplayValue(startValue);
      }
    }, 1000 / 30); // 30fps
    
    return () => clearInterval(counter);
  }, [value, duration]);
  
  return (
    <span className={className}>
      {prefix}{displayValue}{suffix}
    </span>
  );
};

// Animated Checkbox
export const AnimatedCheckbox = ({ checked, onChange, className = '' }) => {
  return (
    <motion.div 
      className={`w-6 h-6 rounded-md flex items-center justify-center cursor-pointer ${checked ? 'bg-cyan-500' : 'bg-gray-700'} ${className}`}
      onClick={onChange}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <AnimatePresence>
        {checked && (
          <motion.svg 
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="w-4 h-4 text-white" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </motion.svg>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Pulse Effect
export const PulseEffect = ({ children, className = '', pulseSize = 1.05, pulseDuration = 2 }) => {
  return (
    <motion.div
      className={className}
      animate={{ 
        scale: [1, pulseSize, 1],
      }}
      transition={{ 
        duration: pulseDuration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
};

// Gradient Text
export const GradientText = ({ 
  children, 
  className = '', 
  gradient = 'from-cyan-400 via-blue-500 to-teal-400',
  animated = true
}) => {
  return (
    <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent ${animated ? 'animate-gradient-shift' : ''} ${className}`}>
      {children}
    </span>
  );
};

// Neo Button Gradient
export const NeoGradientButton = ({
  children,
  className = '',
  gradient = 'from-cyan-500 to-blue-600',
  shadowColor = 'shadow-neo-pop',
  onClick
}) => {
  return (
    <motion.button
      className={`bg-gradient-to-r ${gradient} px-6 py-3 font-bold ${shadowColor} rounded-md text-white ${className}`}
      whileHover={{ scale: 1.05, y: -3 }}
      whileTap={{ scale: 0.97, y: 0 }}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
};

// Animated Form Input
export const AnimatedInput = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
  error = '',
  label = ''
}) => {
  const [focused, setFocused] = React.useState(false);
  
  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      )}
      <motion.div
        className={`relative overflow-hidden rounded-lg ${error ? 'border-2 border-red-500' : (focused ? 'border-2 border-cyan-500' : 'border border-gray-700')}`}
        animate={{ 
          boxShadow: focused 
            ? '0 0 0 2px rgba(6, 182, 212, 0.25)' 
            : (error ? '0 0 0 2px rgba(239, 68, 68, 0.25)' : 'none')
        }}
      >
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full p-3 bg-gray-800 text-white outline-none"
        />
        <motion.div 
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500"
          initial={{ width: '0%' }}
          animate={{ width: focused ? '100%' : '0%' }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-red-500 text-xs mt-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default {
  FadeIn,
  SlideInRight,
  SlideInLeft,
  SlideInUp,
  SlideInDown,
  Card3D,
  MorphingBlob,
  GlowingText,
  ShimmeringBorder,
  FloatingElement,
  ParallaxLayer,
  GradientBackground,
  NeoButton,
  GlassCard,
  RippleButton,
  AnimatedCounter,
  AnimatedCheckbox,
  PulseEffect,
  GradientText,
  NeoGradientButton,
  AnimatedInput
};
