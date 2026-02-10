import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, ContactShadows, Sphere, Torus, Icosahedron, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const FloatingShapes = () => {
    return (
        <group>
            {/* Main Floating Icosahedron - Hero Object */}
            <Float
                speed={1.5} // Animation speed
                rotationIntensity={1.5} // XYZ rotation intensity
                floatIntensity={2} // Up/down float intensity
                position={[2, 0, -2]}
            >
                <Icosahedron args={[1.2, 0]}>
                    <meshStandardMaterial
                        color="#3b82f6" // Blue-500
                        roughness={0.1}
                        metalness={0.1}
                        transparent={true}
                        opacity={0.5}
                        wireframe={false}
                    />
                </Icosahedron>
            </Float>

            {/* Secondary Torus */}
            <Float
                speed={2}
                rotationIntensity={2}
                floatIntensity={1.5}
                position={[-2.5, 1, -3]}
            >
                <Torus args={[0.9, 0.25, 16, 32]}>
                    <meshStandardMaterial
                        color="#8b5cf6" // Violet-500
                        roughness={0.1}
                        metalness={0.5}
                        transparent={true}
                        opacity={0.6}
                    />
                </Torus>
            </Float>

            {/* Small Sphere */}
            <Float
                speed={1}
                rotationIntensity={1}
                floatIntensity={1}
                position={[-1, -1.5, -1]}
            >
                <Sphere args={[0.5, 32, 32]}>
                    <meshStandardMaterial
                        color="#ec4899" // Pink-500
                        roughness={0.4}
                        metalness={0.3}
                    />
                </Sphere>
            </Float>

            {/* Background Sparkles for Depth */}
            <Sparkles
                count={80}
                scale={10}
                size={3}
                speed={0.4}
                opacity={0.5}
                color="#60a5fa" // Blue-400
            />
        </group>
    );
};

const ThreeBackground = () => {
    return (
        <div className="absolute inset-0 w-full h-full -z-10 bg-gradient-to-b from-slate-50 via-white to-white overflow-hidden pointer-events-none">
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 5]} />

                {/* Lighting */}
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />

                {/* Content */}
                <FloatingShapes />


            </Canvas>
        </div>
    );
};

export default ThreeBackground;
