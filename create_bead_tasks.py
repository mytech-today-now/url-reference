#!/usr/bin/env python3
"""
Script to create bead tasks from bead-tasks-hel.md
Parses the markdown file and creates tasks using bd CLI
"""

import re
import subprocess
import tempfile
import os
from pathlib import Path

# Task mapping: hel.x.y -> bead-id
task_map = {}

# Epic already created
task_map["hel.0"] = "uur-1-5-97e"

def parse_task_block(block):
    """Parse a task block and extract metadata"""
    task = {}
    
    # Extract ID
    id_match = re.search(r'\*\*ID:\*\*\s+(\S+)', block)
    if id_match:
        task['id'] = id_match.group(1)
    
    # Extract Type
    type_match = re.search(r'\*\*Type:\*\*\s+(\S+)', block)
    if type_match:
        task['type'] = type_match.group(1)
    
    # Extract Priority
    priority_match = re.search(r'\*\*Priority:\*\*\s+(\S+)', block)
    if priority_match:
        task['priority'] = priority_match.group(1)
    
    # Extract Estimate
    estimate_match = re.search(r'\*\*Estimate:\*\*\s+(\d+)\s+minutes', block)
    if estimate_match:
        task['estimate'] = estimate_match.group(1)
    
    # Extract Labels
    labels_match = re.search(r'\*\*Labels:\*\*\s+(.+)', block)
    if labels_match:
        task['labels'] = labels_match.group(1).strip()
    
    # Extract Dependencies
    deps_match = re.search(r'\*\*Dependencies:\*\*\s+(.+)', block)
    if deps_match:
        task['dependencies'] = deps_match.group(1).strip()
    
    # Extract Title
    title_match = re.search(r'###\s+Task:\s+(.+)', block)
    if title_match:
        task['title'] = title_match.group(1).strip()
    
    # Extract Description
    desc_match = re.search(r'\*\*Description:\*\*\s*\n\n(.+?)(?=\n\n\*\*)', block, re.DOTALL)
    if desc_match:
        task['description'] = desc_match.group(1).strip()
    
    # Extract Deliverables
    deliv_match = re.search(r'\*\*Deliverables:\*\*\s*\n(.+?)(?=\n\n\*\*)', block, re.DOTALL)
    if deliv_match:
        task['deliverables'] = deliv_match.group(1).strip()
    
    # Extract Acceptance Criteria
    accept_match = re.search(r'\*\*Acceptance Criteria:\*\*\s*\n(.+?)(?=\n\n\*\*|---|\Z)', block, re.DOTALL)
    if accept_match:
        task['acceptance'] = accept_match.group(1).strip()
    
    return task

def create_task_description(task):
    """Create full task description"""
    parts = []
    
    if 'description' in task:
        parts.append(task['description'])
        parts.append('')
    
    if 'deliverables' in task:
        parts.append('DELIVERABLES:')
        parts.append(task['deliverables'])
        parts.append('')
    
    if 'acceptance' in task:
        parts.append('ACCEPTANCE CRITERIA:')
        parts.append(task['acceptance'])
        parts.append('')
    
    if 'dependencies' in task:
        parts.append(f"Dependencies: {task['dependencies']}")
        parts.append('')
    
    parts.append(f"Task ID: {task['id']}")
    
    return '\n'.join(parts)

def create_bead_task(task):
    """Create a bead task using bd CLI"""
    print(f"Creating {task['id']}: {task['title']}...")
    
    # Create temp file for description
    with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt') as f:
        desc = create_task_description(task)
        f.write(desc)
        temp_file = f.name
    
    try:
        # Build command
        cmd = [
            'bd', 'create', task['title'],
            '--type', task.get('type', 'task'),
            '--priority', task.get('priority', 'P2'),
            '--body-file', temp_file,
            '--silent'
        ]
        
        if 'estimate' in task:
            cmd.extend(['--estimate', task['estimate']])
        
        if 'labels' in task:
            # Add task ID to labels
            labels = f"{task['labels']},{task['id']}"
            cmd.extend(['--labels', labels])
        
        # Execute command
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        bead_id = result.stdout.strip()
        
        print(f"  ✓ Created: {bead_id}")
        return bead_id
        
    except subprocess.CalledProcessError as e:
        print(f"  ✗ Failed: {e.stderr}")
        return None
    finally:
        os.unlink(temp_file)

def main():
    print("Creating bead tasks from bead-tasks-hel.md")
    print("=" * 60)
    print()
    
    # Read markdown file
    with open('bead-tasks-hel.md', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Split into task blocks (### Task: sections)
    task_blocks = re.split(r'(?=###\s+Task:)', content)
    
    tasks_created = 0
    
    for block in task_blocks:
        if '### Task:' not in block:
            continue
        
        task = parse_task_block(block)
        
        if 'id' in task and 'title' in task:
            bead_id = create_bead_task(task)
            if bead_id:
                task_map[task['id']] = bead_id
                tasks_created += 1
    
    print()
    print(f"Created {tasks_created} tasks")
    print()
    print("Task mapping:")
    for task_id, bead_id in sorted(task_map.items()):
        print(f"  {task_id} -> {bead_id}")

if __name__ == '__main__':
    main()

