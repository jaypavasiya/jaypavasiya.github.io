import { RoundedBox } from '@react-three/drei'
import { BallCollider, CapsuleCollider, ConeCollider, CuboidCollider } from '@react-three/rapier'
import { Toy } from './Toy'
import type { WorldColors } from './theme'

function Cube({ position, size, color, yaw = 0 }: { position: [number, number, number]; size: number; color: string; yaw?: number }) {
  return (
    <Toy position={position} rotation={[0, yaw, 0]}>
      <CuboidCollider args={[size / 2, size / 2, size / 2]} density={0.5} />
      <RoundedBox args={[size, size, size]} radius={size * 0.16} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.45} />
      </RoundedBox>
    </Toy>
  )
}

function Ball({ position, r, color }: { position: [number, number, number]; r: number; color: string }) {
  return (
    <Toy position={position} restitution={0.55} friction={0.5} punch={6}>
      <BallCollider args={[r]} density={0.4} />
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[r, 32, 20]} />
        <meshStandardMaterial color={color} roughness={0.35} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} scale={1.004}>
        <torusGeometry args={[r, r * 0.08, 8, 40]} />
        <meshStandardMaterial color="#fffaf0" roughness={0.4} />
      </mesh>
    </Toy>
  )
}

function Cone({ position, color, stripe }: { position: [number, number, number]; color: string; stripe: string }) {
  return (
    <Toy position={position}>
      <ConeCollider args={[0.5, 0.42]} position={[0, 0.06, 0]} density={0.5} />
      <mesh castShadow receiveShadow position={[0, 0.06, 0]}>
        <coneGeometry args={[0.42, 1, 24]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.0, 0]}>
        <cylinderGeometry args={[0.25, 0.28, 0.14, 24]} />
        <meshStandardMaterial color={stripe} roughness={0.5} />
      </mesh>
      <RoundedBox args={[0.95, 0.12, 0.95]} radius={0.05} smoothness={2} position={[0, -0.5, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.5} />
      </RoundedBox>
      <CuboidCollider args={[0.475, 0.06, 0.475]} position={[0, -0.5, 0]} density={0.5} />
    </Toy>
  )
}

function Pin({ position, color, stripe }: { position: [number, number, number]; color: string; stripe: string }) {
  return (
    <Toy position={position} punch={3}>
      <CapsuleCollider args={[0.28, 0.17]} density={0.35} />
      <mesh castShadow receiveShadow>
        <capsuleGeometry args={[0.17, 0.56, 8, 20]} />
        <meshStandardMaterial color={color} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.165, 0.035, 8, 28]} />
        <meshStandardMaterial color={stripe} roughness={0.4} />
      </mesh>
    </Toy>
  )
}

export function Playthings({ colors }: { colors: WorldColors }) {
  const white = colors.dark ? '#f3ecdc' : '#fffaf0'
  return (
    <>
      {/* stacked tower, left */}
      <Cube position={[-4.4, 0.45, 1.2]} size={0.9} color={colors.accent2} yaw={0.2} />
      <Cube position={[-4.35, 1.36, 1.2]} size={0.86} color={colors.accent3} yaw={-0.15} />
      <Cube position={[-4.4, 2.22, 1.2]} size={0.8} color={colors.accent} yaw={0.35} />
      <Cube position={[-3.2, 0.36, 2.9]} size={0.72} color={colors.accent4} yaw={0.6} />

      {/* bowling corner, right */}
      <Ball position={[4.6, 0.5, 3.3]} r={0.5} color={colors.accent} />
      {[
        [4.6, 1.8],
        [4.3, 1.25],
        [4.9, 1.25],
        [4.0, 0.7],
        [4.6, 0.7],
        [5.2, 0.7],
      ].map(([x, z], i) => (
        <Pin key={i} position={[x, 0.46, z]} color={white} stripe={i % 2 ? colors.accent2 : colors.accent} />
      ))}

      {/* cones at the back */}
      <Cone position={[3.9, 0.57, -3.9]} color={colors.accent3} stripe={white} />
      <Cone position={[-3.6, 0.57, -4.6]} color={colors.accent2} stripe={white} />
      <Ball position={[5.4, 0.35, -1.6]} r={0.35} color={colors.accent4} />
    </>
  )
}
