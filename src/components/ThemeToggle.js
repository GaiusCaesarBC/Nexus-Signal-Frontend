// client/src/components/ThemeToggle.js - Theme Toggle Button Component (Dark/Darker)

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Moon, Eclipse } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// ============ ANIMATIONS ============
const rotate = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
`;

// ============ STYLED COMPONENTS ============
const ToggleButton = styled.button`
    position: relative;
    width: 70px;
    height: 36px;
    background: ${props => props.isDarker
        ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(124, 58, 237, 0.2) 100%)'
        : 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)'
    };
    border: 1px solid ${props => props.isDarker
        ? 'rgba(139, 92, 246, 0.3)'
        : 'rgba(0, 173, 237, 0.3)'
    };
    border-radius: 24px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    padding: 4px;
    overflow: hidden;

    &:hover {
        border-color: ${props => props.isDarker
            ? 'rgba(139, 92, 246, 0.5)'
            : 'rgba(0, 173, 237, 0.5)'
        };
        box-shadow: ${props => props.isDarker
            ? '0 0 20px rgba(139, 92, 246, 0.4)'
            : '0 0 20px rgba(0, 173, 237, 0.3)'
        };
        transform: translateY(-2px);
    }

    &:active {
        transform: translateY(0);
    }
`;

const ToggleSlider = styled.div`
    position: absolute;
    width: 28px;
    height: 28px;
    background: ${props => props.isDarker
        ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
        : 'linear-gradient(135deg, #00adef 0%, #0088cc 100%)'
    };
    border-radius: 50%;
    transition: transform 0.3s ease;
    transform: translateX(${props => props.isDarker ? '34px' : '2px'});
    box-shadow: ${props => props.isDarker
        ? '0 4px 12px rgba(139, 92, 246, 0.5)'
        : '0 4px 12px rgba(0, 173, 237, 0.5)'
    };
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    animation: ${pulse} 2s ease-in-out infinite;

    &:hover {
        animation: ${rotate} 0.5s ease-in-out;
    }
`;

const IconWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 1;
`;

// ============ COMPONENT ============
const ThemeToggle = () => {
    const { currentTheme, toggleTheme } = useTheme();
    const isDarker = currentTheme === 'darker';

    return (
        <ToggleButton 
            onClick={toggleTheme}
            isDarker={isDarker}
            title={isDarker ? 'Switch to Dark Mode' : 'Switch to Darker Mode'}
        >
            <ToggleSlider isDarker={isDarker}>
                <IconWrapper>
                    {isDarker ? <Eclipse size={16} /> : <Moon size={16} />}
                </IconWrapper>
            </ToggleSlider>
        </ToggleButton>
    );
};

export default ThemeToggle;