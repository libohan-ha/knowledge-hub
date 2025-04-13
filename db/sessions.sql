-- 创建会话表
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- 启用行级安全
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- 创建会话表的安全策略
CREATE POLICY "Users can only access their own sessions" ON sessions
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
