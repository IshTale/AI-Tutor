import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

export type NodeCategory = "root" | "kernel" | "library" | "highlight" | "service" | "userspace";

export type TreeNode = {
  id: string;
  label: string;
  sublabel: string;
  category: NodeCategory;
  description: string;
  children?: TreeNode[];
};

const LINUX_TREE: TreeNode = {
  id: "linux",
  label: "Linux",
  sublabel: "Operating System",
  category: "root",
  description:
    "An open-source Unix-like operating system kernel first released in 1991 by Linus Torvalds. Today it underpins the majority of web servers, cloud infrastructure, and embedded devices on the planet.",
  children: [
    {
      id: "kernel",
      label: "Linux Kernel",
      sublabel: "v6.x core",
      category: "kernel",
      description:
        "The core of the OS. Manages hardware resources, process scheduling, memory allocation, device drivers, and exposes system calls to user space.",
      children: [
        {
          id: "scheduler",
          label: "CFS Scheduler",
          sublabel: "Process management",
          category: "kernel",
          description:
            "Completely Fair Scheduler allocates CPU time using a red-black tree ordered by virtual runtime. Ensures no process is starved while maximising throughput.",
        },
        {
          id: "mm",
          label: "Memory Manager",
          sublabel: "Virtual memory",
          category: "kernel",
          description:
            "Manages physical and virtual memory via paging, the buddy allocator, and slab caches. Each process gets an isolated virtual address space.",
        },
        {
          id: "vfs",
          label: "VFS Layer",
          sublabel: "Virtual file system",
          category: "kernel",
          description:
            "Abstraction over concrete file systems (ext4, btrfs, tmpfs, procfs). All file I/O goes through VFS so user-space code is file-system agnostic.",
        },
        {
          id: "netstack",
          label: "Network Stack",
          sublabel: "TCP/IP implementation",
          category: "kernel",
          description:
            "Full TCP/IP networking built into the kernel. Includes the socket API, Netfilter hooks that power iptables/nftables, and hardware NIC drivers.",
          children: [
            {
              id: "tcpip",
              label: "TCP / IP",
              sublabel: "Transport layer",
              category: "kernel",
              description:
                "Kernel implementation of IPv4/IPv6, TCP, UDP, and ICMP. Handles connection state machines, retransmission timers, and flow control.",
            },
            {
              id: "netfilter",
              label: "Netfilter",
              sublabel: "Packet filtering",
              category: "kernel",
              description:
                "Hook framework for packet inspection, filtering, NAT, and port redirection. The engine behind iptables, nftables, and conntrack.",
            },
          ],
        },
      ],
    },
    {
      id: "libs",
      label: "Core Libraries",
      sublabel: "Shared system layer",
      category: "library",
      description:
        "Shared libraries that every program on Linux links against. They bridge user-space code to kernel system calls and provide portable, optimised implementations of common algorithms.",
      children: [
        {
          id: "glibc",
          label: "glibc",
          sublabel: "GNU C Library",
          category: "library",
          description:
            "The primary C standard library. Wraps kernel syscalls, implements POSIX APIs, provides dynamic linking, locale support, and the standard C runtime.",
        },
        {
          id: "openssl",
          label: "OpenSSL",
          sublabel: "Cryptography & TLS",
          category: "highlight",
          description:
            "The most widely deployed cryptographic library on Linux. Implements TLS 1.0–1.3, a full suite of symmetric and asymmetric ciphers, X.509 certificate handling, and PKCS standards. Used by Apache, nginx, curl, git, OpenSSH, and thousands of packages.",
          children: [
            {
              id: "libssl",
              label: "libssl",
              sublabel: "TLS / SSL protocol",
              category: "highlight",
              description:
                "Implements the TLS handshake, session resumption, certificate chain validation, and cipher-suite negotiation. Supports TLS 1.3 with 0-RTT and post-quantum key exchange.",
            },
            {
              id: "libcrypto",
              label: "libcrypto",
              sublabel: "Cryptographic primitives",
              category: "highlight",
              description:
                "Core cryptographic engine. Provides AES-GCM, ChaCha20-Poly1305, RSA, ECDSA, X25519, SHA-2/3, HMAC, HKDF, and PKCS#11 hardware offload.",
            },
          ],
        },
        {
          id: "libpthread",
          label: "libpthread",
          sublabel: "POSIX threads",
          category: "library",
          description:
            "POSIX threading for Linux. Provides mutexes, condition variables, read-write locks, barriers, thread-local storage, and cancellation points.",
        },
        {
          id: "libm",
          label: "libm",
          sublabel: "Math library",
          category: "library",
          description:
            "Standard C floating-point library. Provides sin, cos, sqrt, pow, and 50+ other functions, optimised with SIMD instructions where available.",
        },
      ],
    },
    {
      id: "services",
      label: "System Services",
      sublabel: "Runtime daemons",
      category: "service",
      description:
        "Long-running background processes that constitute the operational OS layer — init, IPC, logging, and remote access.",
      children: [
        {
          id: "systemd",
          label: "systemd",
          sublabel: "Init system (PID 1)",
          category: "service",
          description:
            "The first user-space process. Bootstraps all other services, manages their lifecycle, handles socket activation, mounts filesystems, and runs journald for structured logging.",
        },
        {
          id: "dbus",
          label: "D-Bus",
          sublabel: "IPC message bus",
          category: "service",
          description:
            "Message-passing system for inter-process communication. Lets processes expose structured APIs across process boundaries without shared memory or custom sockets.",
        },
        {
          id: "openssh",
          label: "OpenSSH",
          sublabel: "Remote access (links OpenSSL)",
          category: "service",
          description:
            "Secure shell daemon for encrypted remote terminal sessions and file transfer. Delegates all cryptographic operations to OpenSSL's libcrypto, making it directly dependent on OpenSSL's correctness.",
        },
      ],
    },
    {
      id: "userspace",
      label: "User Space",
      sublabel: "Shell & tooling",
      category: "userspace",
      description:
        "The user-facing layer: the shell, fundamental command-line utilities, and the package manager that installs and tracks everything else.",
      children: [
        {
          id: "bash",
          label: "GNU Bash",
          sublabel: "Default shell",
          category: "userspace",
          description:
            "Bourne Again Shell. Reads commands interactively or from scripts, manages job control, handles pipes and redirections, and exposes environment variables to child processes.",
        },
        {
          id: "coreutils",
          label: "GNU Coreutils",
          sublabel: "Core utilities",
          category: "userspace",
          description:
            "~100 fundamental tools: ls, cp, mv, rm, cat, grep, sort, wc, chmod. Every Linux system depends on these binaries from the very first boot.",
        },
        {
          id: "apt",
          label: "apt / dpkg",
          sublabel: "Package manager",
          category: "userspace",
          description:
            "Debian's package management system. apt fetches packages, resolves dependency graphs, and invokes dpkg which tracks the installed file manifest and handles upgrades atomically.",
        },
      ],
    },
  ],
};

// ─── Layout ───────────────────────────────────────────────────────────────────

const NODE_W = 164;
const NODE_H = 52;
const H_GAP = 28;
const V_GAP = 80;

type PositionedNode = {
  node: TreeNode;
  x: number;
  y: number;
  parentId: string | null;
};

function subtreeWidth(node: TreeNode, collapsed: Set<string>): number {
  if (!node.children || collapsed.has(node.id)) return NODE_W + H_GAP;
  const sum = node.children.reduce((acc, c) => acc + subtreeWidth(c, collapsed), 0);
  return Math.max(NODE_W + H_GAP, sum);
}

function layout(
  node: TreeNode,
  depth: number,
  leftEdge: number,
  collapsed: Set<string>,
  parentId: string | null,
  out: PositionedNode[],
): void {
  const sw = subtreeWidth(node, collapsed);
  const cx = leftEdge + sw / 2;
  out.push({ node, x: cx, y: depth * (NODE_H + V_GAP), parentId });

  if (node.children && !collapsed.has(node.id)) {
    let childLeft = leftEdge;
    for (const child of node.children) {
      layout(child, depth + 1, childLeft, collapsed, node.id, out);
      childLeft += subtreeWidth(child, collapsed);
    }
  }
}

// ─── Category colours ────────────────────────────────────────────────────────

const CATEGORY_STYLES: Record<NodeCategory, { bg: string; border: string; text: string; glow: string }> = {
  root:      { bg: "#1f7a6b", border: "#155f54", text: "#ffffff",  glow: "rgba(31,122,107,0.45)" },
  kernel:    { bg: "#1a5c52", border: "#10403a", text: "#e8f4f2",  glow: "rgba(26,92,82,0.4)" },
  library:   { bg: "#2d6a9f", border: "#1e4f7a", text: "#e8f1fa",  glow: "rgba(45,106,159,0.4)" },
  highlight: { bg: "#c47a1e", border: "#9a5f10", text: "#fff8ee",  glow: "rgba(196,122,30,0.55)" },
  service:   { bg: "#7a3b6e", border: "#5e2c54", text: "#f5ecf4",  glow: "rgba(122,59,110,0.4)" },
  userspace: { bg: "#4a6b5a", border: "#354f41", text: "#eaf2ee",  glow: "rgba(74,107,90,0.4)" },
};

// ─── Component ────────────────────────────────────────────────────────────────

// Start with everything collapsed — only the root is visible
function allIds(node: TreeNode): string[] {
  return [node.id, ...(node.children ?? []).flatMap(allIds)];
}
const ALL_COLLAPSED = new Set(allIds(LINUX_TREE));

export function SystemDiagram() {
  const [collapsed, setCollapsed] = useState<Set<string>>(ALL_COLLAPSED);
  const [selected, setSelected] = useState<TreeNode | null>(LINUX_TREE);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);

  const nodes = useMemo<PositionedNode[]>(() => {
    const out: PositionedNode[] = [];
    layout(LINUX_TREE, 0, 0, collapsed, null, out);
    return out;
  }, [collapsed]);

  const totalW = useMemo(() => subtreeWidth(LINUX_TREE, collapsed), [collapsed]);
  const totalH = useMemo(() => {
    const maxY = Math.max(...nodes.map((n) => n.y));
    return maxY + NODE_H + 40;
  }, [nodes]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      if (totalW > 0 && totalH > 0) {
        const s = Math.min(width / totalW, (height - 32) / totalH, 1);
        setScale(s);
        setOffsetX(Math.max(0, (width - totalW * s) / 2));
      }
    };
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, [totalW, totalH]);

  const posMap = useMemo(() => {
    const m = new Map<string, PositionedNode>();
    nodes.forEach((n) => m.set(n.node.id, n));
    return m;
  }, [nodes]);

  const toggleCollapse = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const svgPaths = useMemo(() => {
    return nodes
      .filter((n) => n.parentId !== null)
      .map((n) => {
        const parent = posMap.get(n.parentId!);
        if (!parent) return null;
        const x1 = parent.x;
        const y1 = parent.y + NODE_H;
        const x2 = n.x;
        const y2 = n.y;
        const cy = (y1 + y2) / 2;
        return (
          <path
            key={`${n.parentId}-${n.node.id}`}
            d={`M${x1},${y1} C${x1},${cy} ${x2},${cy} ${x2},${y2}`}
            fill="none"
            stroke={n.node.category === "highlight" ? "rgba(196,122,30,0.5)" : "rgba(29,40,38,0.18)"}
            strokeWidth={n.node.category === "highlight" ? 2 : 1.5}
          />
        );
      });
  }, [nodes, posMap]);

  return (
    <div className="diagram-shell">
      {/* Info panel */}
      {selected && (
        <div className="diagram-info">
          <div
            className="diagram-info-badge"
            style={{ background: CATEGORY_STYLES[selected.category].bg }}
          >
            {selected.label}
          </div>
          <p className="diagram-info-sub">{selected.sublabel}</p>
          <p className="diagram-info-desc">{selected.description}</p>
          {selected.children && (
            <p className="diagram-info-hint">
              {collapsed.has(selected.id) ? "Click + to expand children" : "Click − to collapse"}
            </p>
          )}
        </div>
      )}

      {/* Tree canvas */}
      <div className="diagram-scroll" ref={containerRef}>
        <div
          className="diagram-canvas"
          style={{
            width: totalW,
            height: totalH,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            marginLeft: offsetX,
          }}
        >
          <svg
            className="diagram-svg"
            width={totalW}
            height={totalH}
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          >
            {svgPaths}
          </svg>

          {nodes.map(({ node, x, y }) => {
            const style = CATEGORY_STYLES[node.category];
            const isSelected = selected?.id === node.id;
            const hasChildren = !!node.children;
            const isCollapsed = collapsed.has(node.id);

            return (
              <button
                key={node.id}
                className={`diagram-node${isSelected ? " selected" : ""}${node.category === "highlight" ? " highlighted" : ""}`}
                style={{
                  left: x - NODE_W / 2,
                  top: y,
                  width: NODE_W,
                  height: NODE_H,
                  background: style.bg,
                  borderColor: style.border,
                  color: style.text,
                  "--glow": style.glow,
                } as React.CSSProperties}
                onClick={() => setSelected(node)}
              >
                <span className="diagram-node-label">{node.label}</span>
                <span className="diagram-node-sub">{node.sublabel}</span>
                {hasChildren && (
                  <span
                    className="diagram-node-toggle"
                    role="button"
                    onClick={(e) => toggleCollapse(node.id, e)}
                    title={isCollapsed ? "Expand" : "Collapse"}
                  >
                    {isCollapsed ? "+" : "−"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
