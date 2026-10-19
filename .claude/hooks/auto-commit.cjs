#!/usr/bin/env node
// PostToolUse hook (Write|Edit): stage the touched file and commit it immediately.
const path = require('path');
const { execFileSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..', '..');

let input;
try {
  const raw = require('fs').readFileSync(0, 'utf8');
  input = JSON.parse(raw);
} catch {
  process.exit(0);
}

const filePath =
  (input.tool_input && input.tool_input.file_path) ||
  (input.tool_response && input.tool_response.filePath);

if (!filePath) process.exit(0);

try {
  execFileSync('git', ['add', '--', filePath], { cwd: repoRoot, stdio: 'ignore' });

  try {
    execFileSync('git', ['diff', '--cached', '--quiet'], { cwd: repoRoot, stdio: 'ignore' });
    process.exit(0); // nothing staged, no-op
  } catch {
    // non-zero exit here means there IS a staged diff -> fall through to commit
  }

  execFileSync(
    'git',
    [
      'commit',
      '-m',
      'update',
      '-m',
      'Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>',
    ],
    { cwd: repoRoot, stdio: 'ignore' }
  );
} catch {
  // never block the tool call on a commit failure
  process.exit(0);
}
