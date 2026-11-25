'use client';

import { useEffect } from 'react';

const HOST_CLASS = 'material-ripple';
const WAVE_CLASS = 'material-ripple-wave';
const TARGETS = 'button:not(:disabled), [role="button"]:not([aria-disabled="true"]), [data-ripple]';

export default function RippleEffect() {
    useEffect(() => {
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

        const addWave = (target: HTMLElement, clientX: number, clientY: number) => {
            if (reducedMotion.matches || target.hasAttribute('data-no-ripple')) return;

            const rect = target.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;

            if (window.getComputedStyle(target).position === 'static') {
                target.style.position = 'relative';
            }
            target.classList.add(HOST_CLASS);

            const size = Math.max(rect.width, rect.height) * 2;
            const wave = document.createElement('span');
            wave.className = WAVE_CLASS;
            wave.setAttribute('aria-hidden', 'true');
            wave.style.width = `${size}px`;
            wave.style.height = `${size}px`;
            wave.style.left = `${clientX - rect.left - size / 2}px`;
            wave.style.top = `${clientY - rect.top - size / 2}px`;

            const remove = () => {
                wave.remove();
                if (!target.querySelector(`.${WAVE_CLASS}`)) {
                    target.classList.remove(HOST_CLASS);
                }
            };

            wave.addEventListener('animationend', remove, { once: true });
            window.setTimeout(remove, 800);
            target.appendChild(wave);
        };

        const onPointerDown = (event: PointerEvent) => {
            if (event.pointerType === 'mouse' && event.button !== 0) return;
            if (!(event.target instanceof Element)) return;

            const target = event.target.closest<HTMLElement>(TARGETS);
            if (target) addWave(target, event.clientX, event.clientY);
        };

        // Keyboard activation gets the same feedback, radiating from the center.
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.repeat || (event.key !== 'Enter' && event.key !== ' ')) return;

            const target = document.activeElement;
            if (!(target instanceof HTMLElement) || !target.matches(TARGETS)) return;

            const rect = target.getBoundingClientRect();
            addWave(target, rect.left + rect.width / 2, rect.top + rect.height / 2);
        };

        document.addEventListener('pointerdown', onPointerDown, true);
        document.addEventListener('keydown', onKeyDown, true);
        return () => {
            document.removeEventListener('pointerdown', onPointerDown, true);
            document.removeEventListener('keydown', onKeyDown, true);
        };
    }, []);

    return null;
}
