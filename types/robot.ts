export interface JointAngles {
  base: number;
  shoulder: number;
  elbow: number;
  wrist: number;
  gripper: number;
  finger: number;
}

export interface RobotState {
  name: string;
  timestamp: number;
  frames: JointAngles[];
}

export interface Device {
  code: string;
  connected: boolean;
  angles?: JointAngles;
}

export type JointType = 'base' | 'shoulder' | 'elbow' | 'wrist' | 'gripper' | 'finger';
