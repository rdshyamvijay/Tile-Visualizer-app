export type Tile = {
  id: string;
  sku: string;
  category: 'floor' | 'wall';
  textureUrl: string;
  previewUrl: string;
  name: string;
  description: string;
};

export type User = {
  id: string;
  email: string;
  name: string;
  role: 'adminSuper' | 'adminOrg' | 'member' | 'endUser';
  organizationId: string;
  credits: number;
};

export type RenderJob = {
  id: string;
  userId: string;
  status: 'pending' | 'completed' | 'failed';
  latency: number;
  createdAt: Date;
  inputImageUrl: string;
  outputImageUrl: string;
};

export type CreditLedgerEntry = {
  id: string;
  userId: string;
  correlationId: string;
  reason: string;
  debit: number;
  credit: number;
  createdAt: Date;
};
