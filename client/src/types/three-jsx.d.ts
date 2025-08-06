import { ReactThreeFiber } from '@react-three/fiber'

declare global {
  namespace JSX {
    interface IntrinsicElements extends ReactThreeFiber.ThreeElements {
      // Three.js JSX elements are now available
    }
  }
}
