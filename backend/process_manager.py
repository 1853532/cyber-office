import psutil
import os
import time

# Use the current user to filter processes
CURRENT_USER = psutil.Process().username()

def classify_process(name):
    name = name.lower()
    if any(x in name for x in ['chrome', 'safari', 'firefox', 'edge', 'brave', 'opera']):
        return 'assistant'
    elif any(x in name for x in ['code', 'idea', 'pycharm', 'webstorm', 'xcode', 'studio', 'sublime', 'vim', 'cursor', 'node', 'python']):
        return 'programmer'
    elif any(x in name for x in ['wechat', 'qq', 'dingtalk', 'lark', 'feishu', 'slack', 'discord', 'telegram', 'whatsapp']):
        return 'social'
    elif any(x in name for x in ['music', 'spotify', 'netease', 'qqmusic', 'player', 'vlc', 'iina', 'steam', 'epic', 'game']):
        return 'entertainment'
    else:
        return 'system'

def get_app_group(info):
    name = info.get('name', '') or ''
    cwd = str(info.get('cwd', ''))
    cmdline = ' '.join(info.get('cmdline', []) or [])
    
    name_lower = name.lower()
    
    if 'antigravity' in cwd or 'antigravity' in cmdline:
        return 'Antigravity'
    if 'chrome' in name_lower:
        return 'Google Chrome'
    if 'safari' in name_lower:
        return 'Safari'
    if 'code' in name_lower and ('visual' in name_lower or 'helper' in name_lower):
        return 'VS Code'
    if 'wechat' in name_lower:
        return 'WeChat'
    
    # Capitalize first letter for group
    return name.capitalize() if name else 'System'

def get_active_processes():
    active_procs = []
    # Iterate over all running process
    for proc in psutil.process_iter(['pid', 'name', 'username', 'cpu_percent', 'memory_info', 'create_time', 'cwd', 'cmdline']):
        try:
            info = proc.info
            
            # Filter for current user only to avoid permission issues when killing
            if info['username'] != CURRENT_USER:
                continue
                
            mem_mb = info['memory_info'].rss / (1024 * 1024) if info['memory_info'] else 0
            cpu_usage = info['cpu_percent'] or 0.0
            
            # Filter: CPU > 0.5% or Memory > 30MB (lowered to catch more scripts)
            if (cpu_usage > 0.5 or mem_mb > 30) and info['name']:
                # Filter out boring/invisible processes on macOS
                name_lower = info['name'].lower()
                if any(ignored in name_lower for ignored in ['helper', 'daemon', 'agent', 'service', 'mdworker', 'coreaudiod', 'windowserver', 'spotlight']):
                    continue
                
                proc_name = info['name'].encode('utf-8', 'ignore').decode('utf-8')
                group_name = get_app_group(info).encode('utf-8', 'ignore').decode('utf-8')
                
                # Determine role based on group or name
                proc_role = classify_process(proc_name)
                if group_name == 'Antigravity' or group_name == 'VS Code':
                    proc_role = 'programmer'
                
                active_procs.append({
                    "pid": info['pid'],
                    "name": proc_name,
                    "group": group_name,
                    "role": proc_role,
                    "cpu": round(cpu_usage, 2),
                    "memory_mb": round(mem_mb, 2),
                    "uptime": round(time.time() - info['create_time'], 2) if info['create_time'] else 0
                })
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            pass
            
    # Group the processes
    groups = {}
    for p in active_procs:
        g = p['group']
        if g not in groups:
            groups[g] = []
        groups[g].append(p)
        
    final_output = []
    for g, procs in groups.items():
        total_cpu = sum(p['cpu'] for p in procs)
        total_mem = sum(p['memory_mb'] for p in procs)
        if len(procs) > 1 or total_mem > 500: # Create a door if multiple processes or very heavy
            final_output.append({
                "isGroup": True,
                "id": g, # Unique ID for the room
                "name": g,
                "cpu": round(total_cpu, 2),
                "memory_mb": round(total_mem, 2),
                "children": procs
            })
        else:
            p = procs[0]
            p["isGroup"] = False
            p["id"] = str(p["pid"])
            final_output.append(p)
            
    # Sort by memory descending, limit to 20 items (doors or individuals)
    return sorted(final_output, key=lambda x: x['memory_mb'], reverse=True)[:20]

def kill_process(pid: int):
    try:
        proc = psutil.Process(pid)
        # Ensure it belongs to the current user
        if proc.username() != CURRENT_USER:
            return False, "Access denied. Can only fire your own employees."
            
        proc.terminate() # graceful exit
        proc.wait(timeout=3)
        return True, "Employee successfully fired."
    except psutil.NoSuchProcess:
        return False, "Employee already left."
    except Exception as e:
        return False, str(e)
