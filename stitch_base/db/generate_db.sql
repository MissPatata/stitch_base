CREATE TABLE pattern (
  id TEXT PRIMARY KEY,
  garment_type TEXT NOT NULL,
  length TEXT,
  name TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE design (
  id TEXT PRIMARY KEY,
  garment_type TEXT NOT NULL,
  length TEXT,
  name TEXT NOT NULL,
  description TEXT,
  tags TEXT, -- JSON array as TEXT
  collection TEXT,
  process_status TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pattern_to_design (
  pattern_id TEXT NOT NULL,
  design_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (pattern_id, design_id),
  FOREIGN KEY (pattern_id) REFERENCES pattern(id),
  FOREIGN KEY (design_id) REFERENCES design(id)
);

CREATE TABLE design_image (
  id TEXT PRIMARY KEY,
  design_id TEXT NOT NULL,
  url TEXT NOT NULL,
  is_preview BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (design_id) REFERENCES design(id)
);

CREATE TABLE design_set (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  tags TEXT, -- JSON array as TEXT
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE design_set_to_design (
  design_set_id TEXT NOT NULL,
  design_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (design_set_id, design_id),
  FOREIGN KEY (design_set_id) REFERENCES design_set(id),
  FOREIGN KEY (design_id) REFERENCES design(id)
);
