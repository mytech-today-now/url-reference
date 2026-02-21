#!/usr/bin/env python3
"""
Script to add dependencies between bead tasks
Based on the Dependencies field in bead-tasks-hel.md
"""

import re
import subprocess

# Task mapping from create_bead_tasks.py output
task_map = {
    "hel.0": "uur-1-5-97e",
    "hel.1.1": "uur-1-5-iut",
    "hel.1.2": "uur-1-5-m6u",
    "hel.1.3": "uur-1-5-maf",
    "hel.2.1": "uur-1-5-btl",
    "hel.2.2": "uur-1-5-52x",
    "hel.2.3": "uur-1-5-slv",
    "hel.2.4": "uur-1-5-2lt",
    "hel.2.5": "uur-1-5-7qa",
    "hel.2.6": "uur-1-5-469",
    "hel.3.1": "uur-1-5-aoy",
    "hel.3.2": "uur-1-5-n9m",
    "hel.3.3": "uur-1-5-e4n",
    "hel.3.4": "uur-1-5-41q",
    "hel.3.5": "uur-1-5-8dt",
    "hel.4.1": "uur-1-5-8ve",
    "hel.4.2": "uur-1-5-2p9",
    "hel.4.3": "uur-1-5-9hs",
    "hel.5.1": "uur-1-5-sob",
    "hel.5.2": "uur-1-5-p6h",
    "hel.5.3": "uur-1-5-roh",
    "hel.5.4": "uur-1-5-ach",
    "hel.5.5": "uur-1-5-85n",
    "hel.6.1": "uur-1-5-056",
    "hel.6.2": "uur-1-5-bo8",
    "hel.6.3": "uur-1-5-01p",
    "hel.7.1": "uur-1-5-638",
    "hel.7.2": "uur-1-5-rii",
    "hel.7.3": "uur-1-5-sic",
    "hel.7.4": "uur-1-5-qkz",
    "hel.8.1": "uur-1-5-29l",
    "hel.8.2": "uur-1-5-8go",
    "hel.8.3": "uur-1-5-3vd",
    "hel.8.4": "uur-1-5-w8m",
    "hel.8.5": "uur-1-5-33f",
    "hel.8.6": "uur-1-5-275",
    "hel.9.1": "uur-1-5-dnk",
    "hel.9.2": "uur-1-5-3qy",
    "hel.9.3": "uur-1-5-boq",
    "hel.9.4": "uur-1-5-r3q",
}

# Dependencies from bead-tasks-hel.md
dependencies = {
    "hel.1.2": ["hel.1.1"],
    "hel.1.3": ["hel.1.1"],
    "hel.2.1": ["hel.1.1"],
    "hel.2.2": ["hel.2.1"],
    "hel.2.3": ["hel.2.1"],
    "hel.2.4": ["hel.2.1"],
    "hel.2.5": ["hel.2.2", "hel.2.3", "hel.2.4"],
    "hel.2.6": ["hel.2.2", "hel.2.3", "hel.2.4", "hel.2.5"],
    "hel.3.1": ["hel.2.6"],
    "hel.3.2": ["hel.3.1"],
    "hel.3.3": ["hel.3.1"],
    "hel.3.4": ["hel.3.1"],
    "hel.3.5": ["hel.3.2", "hel.3.3", "hel.3.4"],
    "hel.4.1": ["hel.3.5"],
    "hel.4.2": ["hel.4.1"],
    "hel.4.3": ["hel.4.2"],
    "hel.5.1": ["hel.1.1"],
    "hel.5.2": ["hel.1.1"],
    "hel.5.3": ["hel.1.1"],
    "hel.5.4": ["hel.5.1", "hel.5.2", "hel.5.3"],
    "hel.5.5": ["hel.5.4"],
    "hel.6.1": ["hel.2.5"],
    "hel.6.2": ["hel.5.5"],
    "hel.6.3": ["hel.6.1", "hel.6.2"],
    "hel.7.1": ["hel.3.5", "hel.4.3", "hel.5.5", "hel.6.3"],
    "hel.7.2": ["hel.7.1"],
    "hel.7.3": ["hel.7.2"],
    "hel.7.4": ["hel.7.3"],
    "hel.8.1": ["hel.7.4"],
    "hel.8.2": ["hel.7.4"],
    "hel.8.3": ["hel.7.4"],
    "hel.8.4": ["hel.8.1", "hel.8.2", "hel.8.3"],
    "hel.8.5": ["hel.8.1", "hel.8.2", "hel.8.3"],
    "hel.8.6": ["hel.8.5"],
    "hel.9.1": ["hel.8.6"],
    "hel.9.2": ["hel.9.1"],
    "hel.9.3": ["hel.9.2"],
    "hel.9.4": ["hel.9.3"],
}

def add_dependency(task_id, dep_id):
    """Add a dependency between two tasks"""
    task_bead = task_map.get(task_id)
    dep_bead = task_map.get(dep_id)

    if not task_bead or not dep_bead:
        print(f"  ✗ Missing mapping for {task_id} or {dep_id}")
        return False

    try:
        # task_bead depends on dep_bead (task_bead is blocked by dep_bead)
        cmd = ['bd', 'dep', 'add', task_bead, dep_bead]
        subprocess.run(cmd, capture_output=True, text=True, check=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"  ✗ Failed to add dependency: {e.stderr}")
        return False

def main():
    print("Adding dependencies between bead tasks")
    print("=" * 60)
    print()
    
    total_deps = 0
    added_deps = 0
    
    for task_id, deps in sorted(dependencies.items()):
        print(f"{task_id} ({task_map.get(task_id, '?')}) depends on:")
        for dep_id in deps:
            total_deps += 1
            print(f"  - {dep_id} ({task_map.get(dep_id, '?')})", end=" ")
            if add_dependency(task_id, dep_id):
                print("✓")
                added_deps += 1
            else:
                print("✗")
    
    print()
    print(f"Added {added_deps}/{total_deps} dependencies")

if __name__ == '__main__':
    main()

