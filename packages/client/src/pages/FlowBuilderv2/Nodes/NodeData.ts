import {
  ComparisonType,
  GeneralSelectedType,
  MessageEmailEventCondition,
  MessageEventTypes,
  MessageGeneralComparison,
  MessageInAPPEventCondition,
  MessagePushEventCondition,
  MessageSMSEventCondition,
  StatementValueType,
} from "reducers/flow-builder.reducer";
import { MessageType, ProviderType } from "types/Workflow";
import { NodeType } from "../FlowEditor";

export enum BranchType {
  EVENT = "event",
  MAX_TIME = "maxTime",
  ATTRIBUTE = "attribute",
  WU_ATTRIBUTE = "wu_attribute",
  MESSAGE = "message",
}

export enum LogicRelation {
  AND = "and",
  OR = "or",
}

export enum StatementType {
  PROPERTY = "property",
  ELEMENT = "element",
}

export interface PropertyStatement {
  type: StatementType.PROPERTY;
  key: string;
  comparisonType: ComparisonType;
  valueType: StatementValueType;
  value: string;
  relationToNext: LogicRelation;
}

export enum ElementKey {
  TAG_NAME = "tagName",
  TEXT = "text",
}

export interface ElementStatement {
  type: StatementType.ELEMENT;
  order: number;
  elementKey: ElementKey;
  comparisonType: ComparisonType;
  valueType: StatementValueType;
  value: string;
  relationToNext: LogicRelation;
}

export type Statement = PropertyStatement | ElementStatement;

export interface CommonCondition {
  relationToNext: LogicRelation;
}

export interface TrackerCondition extends CommonCondition {
  providerType: ProviderType.TRACKER;
  trackerId?: string;
  event?: string;
}

export interface HitCondition extends CommonCondition {
  providerType: Exclude<ProviderType, ProviderType.TRACKER>;
  name: string;
  statements: Statement[];
}

export enum WUAttributeHappenCondition {
  CHANGED = "changed",
  CHANGED_TO = "changed to",
}

export interface WUAttributeCondition extends CommonCondition {
  providerType: ProviderType.WU_ATTRIBUTE;
  attributeName: string;
  happenCondition: WUAttributeHappenCondition;
  valueType: Exclude<
    StatementValueType,
    StatementValueType.ARRAY | StatementValueType.OBJECT
  >;
  value: string;
}

export interface MessageCondition extends CommonCondition {
  providerType:
    | ProviderType.EMAIL_MESSAGE
    | ProviderType.SMS_MESSAGE
    | ProviderType.IN_APP_MESSAGE
    | ProviderType.PUSH_MESSAGE;
  from?: GeneralSelectedType;
  happenCondition: MessageGeneralComparison;
  eventCondition:
    | MessageEmailEventCondition
    | MessagePushEventCondition
    | MessageSMSEventCondition
    | MessageInAPPEventCondition;
  fromSpecificMessage: GeneralSelectedType;
}

export type Condition =
  | HitCondition
  | TrackerCondition
  | MessageCondition
  | WUAttributeCondition;

export interface CommonBranch {
  id: string;
}

export interface EventBranch extends CommonBranch {
  type: BranchType.EVENT;
  conditions: Condition[];
}

export interface MessageBranch extends CommonBranch {
  type: BranchType.MESSAGE;
  conditions: Condition[];
}

export interface WUAttributeBranch extends CommonBranch {
  type: BranchType.WU_ATTRIBUTE;
  conditions: Condition[];
}

export enum TimeType {
  TIME_DELAY = "timeDelay",
  TIME_WINDOW = "timeWindow",
}

export interface CommonMaxTimeBranch extends CommonBranch {
  type: BranchType.MAX_TIME;
}

export interface DelayData {
  days: number;
  hours: number;
  minutes: number;
}

export interface TimeDelayBranch extends CommonMaxTimeBranch {
  timeType: TimeType.TIME_DELAY;
  delay: DelayData;
}

export interface TimeWindowBranch extends CommonMaxTimeBranch {
  timeType: TimeType.TIME_WINDOW;
  waitFrom?: string;
  waitTo?: string;
}

export type MaxTimeBranch = TimeDelayBranch | TimeWindowBranch;

export type WaitUntilBranch =
  | EventBranch
  | MaxTimeBranch
  | MessageBranch
  | WUAttributeBranch;

export interface AttributeStatement {
  key: string;
  comparisonType: ComparisonType;
  valueType: StatementValueType;
  relationToNext: LogicRelation;
  value: string;
}

export interface AttributeCondition {
  statements: AttributeStatement[];
  relationToNext: LogicRelation;
}

export interface AttributeBranch extends CommonBranch {
  type: BranchType.ATTRIBUTE;
  attributeConditions: AttributeCondition[];
}

export type Branch =
  | EventBranch
  | MaxTimeBranch
  | AttributeBranch
  | MessageBranch
  | WUAttributeBranch;

export interface Stats {
  sent?: number;
  delivered?: number;
  clickedPercentage?: number;
  wssent?: number;
  openedPercentage?: number;
}

export interface CommonNodeData {
  stepId?: string;
  stats?: Stats;
  showErrors?: boolean;
  disabled?: boolean;
  customersCount?: number;
}

export interface MessageNodeData<T extends MessageType = MessageType>
  extends CommonNodeData {
  type: NodeType.MESSAGE;
  customName?: string;
  template: { type: T; selected?: { id: number; name: string } };
}

export interface WaitUntilNodeData extends CommonNodeData {
  type: NodeType.WAIT_UNTIL;
  branches: WaitUntilBranch[];
}

export interface TimeDelayNodeData extends CommonNodeData {
  type: NodeType.TIME_DELAY;
  delay: DelayData;
}

export enum TimeWindowTypes {
  SPEC_DATES = "SpecDates",
  SPEC_WEEK_DAYS = "SpecWeekDays",
}

export interface TimeWindowNodeData extends CommonNodeData {
  type: NodeType.TIME_WINDOW;
  windowType?: TimeWindowTypes;
  onDays?: number[];
  fromTime?: string;
  toTime?: string;
  from?: string;
  to?: string;
}

export interface UserAttributeNodeData extends CommonNodeData {
  type: NodeType.USER_ATTRIBUTE;
  branches: AttributeBranch[];
}

export interface JumpToNodeData extends CommonNodeData {
  type: NodeType.JUMP_TO;
  targetId?: string;
}

export enum TrackerVisibility {
  SHOW = "show",
  HIDE = "hide",
}

export interface TrackerNodeData extends CommonNodeData {
  type: NodeType.TRACKER;
  needsCheck?: boolean;
  tracker?: {
    trackerId: string;
    trackerTemplate: { id: number; name: string };
    visibility: TrackerVisibility;
    fields: { name: string; type: StatementValueType; value: string }[];
  };
}

export interface AnotherNodeData extends CommonNodeData {
  type?: Exclude<
    NodeType,
    | NodeType.MESSAGE
    | NodeType.WAIT_UNTIL
    | NodeType.TIME_DELAY
    | NodeType.TIME_WINDOW
    | NodeType.USER_ATTRIBUTE
    | NodeType.JUMP_TO
    | NodeType.TRACKER
  >;
}

export type NodeData =
  | MessageNodeData
  | WaitUntilNodeData
  | TimeDelayNodeData
  | TimeWindowNodeData
  | UserAttributeNodeData
  | JumpToNodeData
  | TrackerNodeData
  | AnotherNodeData;
