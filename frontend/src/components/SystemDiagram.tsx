import { useState } from "react";

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

// ─── Category colours ────────────────────────────────────────────────────────

const CATEGORY_STYLES: Record<NodeCategory, { bg: string; border: string; text: string; glow: string }> = {
  root:      { bg: "#1f7a6b", border: "#155f54", text: "#ffffff",  glow: "rgba(31,122,107,0.45)" },
  kernel:    { bg: "#1a5c52", border: "#10403a", text: "#e8f4f2",  glow: "rgba(26,92,82,0.4)" },
  library:   { bg: "#2d6a9f", border: "#1e4f7a", text: "#e8f1fa",  glow: "rgba(45,106,159,0.4)" },
  highlight: { bg: "#c47a1e", border: "#9a5f10", text: "#fff8ee",  glow: "rgba(196,122,30,0.55)" },
  service:   { bg: "#7a3b6e", border: "#5e2c54", text: "#f5ecf4",  glow: "rgba(122,59,110,0.4)" },
  userspace: { bg: "#4a6b5a", border: "#354f41", text: "#eaf2ee",  glow: "rgba(74,107,90,0.4)" },
};

// ─── Tree node component ──────────────────────────────────────────────────────

type TreeItemProps = {
  node: TreeNode;
  depth: number;
  expanded: Set<string>;
  selected: TreeNode | null;
  onSelect: (node: TreeNode) => void;
  onToggle: (id: string) => void;
};

function TreeItem({ node, depth, expanded, selected, onSelect, onToggle }: TreeItemProps) {
  const isExpanded = expanded.has(node.id);
  const isSelected = selected?.id === node.id;
  const hasChildren = !!node.children;
  const style = CATEGORY_STYLES[node.category];

  return (
    <div className="tree-item">
      <button
        className={`tree-card${isSelected ? " selected" : ""}${node.category === "highlight" ? " highlighted" : ""}`}
        style={{
          marginLeft: depth * 20,
          background: style.bg,
          borderColor: style.border,
          color: style.text,
          "--glow": style.glow,
        } as React.CSSProperties}
        onClick={() => {
          onSelect(node);
          if (hasChildren) onToggle(node.id);
        }}
      >
        <div className="tree-card-body">
          <span className="tree-card-label">{node.label}</span>
          <span className="tree-card-sub">{node.sublabel}</span>
        </div>
        {hasChildren && (
          <span className="tree-card-toggle">{isExpanded ? "−" : "+"}</span>
        )}
      </button>

      {hasChildren && isExpanded && (
        <div className="tree-children" style={{ marginLeft: depth * 20 }}>
          {node.children!.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              selected={selected}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────

export function SystemDiagram() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<TreeNode | null>(null);

  const onToggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="diagram-shell">

      {/* Header */}
      <div className="diagram-header">
        <div className="diagram-header-dot" />
        <div>
          <p className="diagram-header-title">Linux Architecture</p>
          <p className="diagram-header-sub">Click any component to expand</p>
        </div>
      </div>

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
        </div>
      )}

      {/* Tree */}
      <div className="diagram-tree">
        {LINUX_TREE.children!.map((node) => (
          <TreeItem
            key={node.id}
            node={node}
            depth={0}
            expanded={expanded}
            selected={selected}
            onSelect={setSelected}
            onToggle={onToggle}
          />
        ))}
      </div>

    </div>
  );
}
