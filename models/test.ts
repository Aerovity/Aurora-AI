/**
 * Test file for all model API functions
 * Run with: npx ts-node models/test.ts
 */

import { callClaudeHaiku } from './claudeHaiku';
import { callClaudeOpus } from './claudeOpus';
import { callQwen3 } from './qwen3';
import { callGemma3 } from './gemma3';

// Test questions
const TEST_QUESTIONS = [
  'What is the theory of relativity?',
  'Explain photosynthesis in simple terms',
  'What is consciousness?'
];

async function testClaudeHaiku() {
  console.log('\n========================================');
  console.log('Testing Claude Haiku 4.5');
  console.log('========================================\n');

  const question = TEST_QUESTIONS[0];
  console.log(`Question: ${question}\n`);

  const result = await callClaudeHaiku(question);

  if (result.success) {
    console.log('✅ SUCCESS');
    if (result.personality) {
      console.log(`Personality: ${result.personality}`);
    }
    console.log(`Response:\n${result.response}\n`);
  } else {
    console.log('❌ ERROR');
    console.log(`Error: ${result.error}\n`);
  }
}

async function testClaudeOpus() {
  console.log('\n========================================');
  console.log('Testing Claude Opus 4.5');
  console.log('========================================\n');

  const question = TEST_QUESTIONS[1];
  console.log(`Question: ${question}\n`);

  const result = await callClaudeOpus(question);

  if (result.success) {
    console.log('✅ SUCCESS');
    if (result.personality) {
      console.log(`Personality: ${result.personality}`);
    }
    console.log(`Response:\n${result.response}\n`);
  } else {
    console.log('❌ ERROR');
    console.log(`Error: ${result.error}\n`);
  }
}

async function testQwen3() {
  console.log('\n========================================');
  console.log('Testing Qwen 0.5B via CactusCompute');
  console.log('========================================\n');

  const question = TEST_QUESTIONS[2];
  console.log(`Question: ${question}\n`);

  const result = await callQwen3(question);

  if (result.success) {
    console.log('✅ SUCCESS');
    if (result.personality) {
      console.log(`Personality: ${result.personality}`);
    }
    console.log(`Response:\n${result.response}\n`);
  } else {
    console.log('❌ ERROR');
    console.log(`Error: ${result.error}\n`);
  }
}

async function testGemma3() {
  console.log('\n========================================');
  console.log('Testing Gemma 1B via CactusCompute');
  console.log('========================================\n');

  const question = TEST_QUESTIONS[0];
  console.log(`Question: ${question}\n`);

  const result = await callGemma3(question);

  if (result.success) {
    console.log('✅ SUCCESS');
    if (result.personality) {
      console.log(`Personality: ${result.personality}`);
    }
    console.log(`Response:\n${result.response}\n`);
  } else {
    console.log('❌ ERROR');
    console.log(`Error: ${result.error}\n`);
  }
}

async function runAllTests() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   AI Model API Functions Test Suite   ║');
  console.log('╚════════════════════════════════════════╝');

  await testClaudeHaiku();
  await testClaudeOpus();
  await testQwen3();
  await testGemma3();

  console.log('\n========================================');
  console.log('All tests completed!');
  console.log('========================================\n');
}

// Run tests
runAllTests().catch(console.error);
