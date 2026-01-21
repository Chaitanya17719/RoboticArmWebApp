export interface JointAngles {
  base: number;
  shoulder: number;
  elbow: number;
  wrist: number;
  gripper: number;
}

export interface RobotState {
  name: string;
  timestamp: number;
  frames: JointAngles[];
}

export interface Device {
  code: string;
  connected: boolean;
}

export type JointType = 'base' | 'shoulder' | 'elbow' | 'wrist' | 'gripper';
