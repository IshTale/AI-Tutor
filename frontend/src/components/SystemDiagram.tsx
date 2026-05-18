import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NodeCategory =
  | "root" | "kernel" | "library" | "highlight"
  | "service" | "userspace" | "protocol" | "crypto";

export type TreeNode = {
  id: string;
  label: string;
  sublabel: string;
  category: NodeCategory;
  description: string;
  children?: TreeNode[];
};

// ─── OpenSSL detailed subtree ─────────────────────────────────────────────────

const OPENSSL_CHILDREN: TreeNode[] = [
  {
    id: "ossl_libcrypto",
    label: "libcrypto",
    sublabel: "General-purpose crypto",
    category: "crypto",
    description: "The general-purpose cryptographic library. Provides mathematical implementations, data manipulation routines, and low-level algorithms. Independent of network protocols.",
    children: [
      {
        id: "ossl_evp",
        label: "EVP API",
        sublabel: "High-level wrapper",
        category: "crypto",
        description: "High-level API wrapper for cryptography. Developers use generic EVP functions, allowing algorithm swaps without rewriting application logic.",
        children: [
          {
            id: "ossl_sym",
            label: "Symmetric Ciphers",
            sublabel: "AES, ChaCha20, GCM",
            category: "crypto",
            description: "High-level wrappers for symmetric encryption like AES and ChaCha20, handling block modes (CBC, GCM) and padding.",
          },
          {
            id: "ossl_asym",
            label: "Asymmetric Ciphers",
            sublabel: "RSA, DSA, ECC",
            category: "crypto",
            description: "Wrappers for public-key operations including RSA, DSA, and ECC — encryption, decryption, signing, and verifying.",
          },
          {
            id: "ossl_digest",
            label: "Message Digests",
            sublabel: "SHA-256, SHA-3, BLAKE2",
            category: "crypto",
            description: "Unified interfaces for hashing algorithms such as SHA-256, SHA-3, and BLAKE2.",
          },
        ],
      },
      {
        id: "ossl_bio",
        label: "BIO Subsystem",
        sublabel: "I/O abstraction layer",
        category: "library",
        description: "OpenSSL's custom I/O abstraction. Provides a uniform interface for reading and writing data regardless of whether the backend is a socket, file, or memory buffer.",
        children: [
          {
            id: "ossl_bio_ss",
            label: "Source/Sink BIOs",
            sublabel: "File, socket, memory",
            category: "library",
            description: "Endpoints for data: BIO_s_file (file I/O), BIO_s_socket (network I/O), and BIO_s_mem (memory buffers).",
          },
          {
            id: "ossl_bio_filter",
            label: "Filter BIOs",
            sublabel: "Transform intermediaries",
            category: "library",
            description: "Intermediaries that modify data in transit, such as BIO_f_base64 (encoding/decoding) or BIO_f_cipher (streaming encryption).",
          },
        ],
      },
      {
        id: "ossl_x509",
        label: "X.509 & ASN.1",
        sublabel: "Certificate handling",
        category: "library",
        description: "Handles parsing, serialization, and validation of digital certificates and complex cryptographic data structures.",
        children: [
          {
            id: "ossl_asn1",
            label: "ASN.1 Parser",
            sublabel: "DER/PEM encoding",
            category: "library",
            description: "Translates abstract ASN.1 notation into C structures and handles DER/PEM encoding and decoding.",
          },
          {
            id: "ossl_chain",
            label: "Chain Verification",
            sublabel: "Trust chain & CRL/OCSP",
            category: "library",
            description: "Validates certificate trust chains, checks Revocation Lists (CRLs), and processes OCSP responses.",
          },
        ],
      },
      {
        id: "ossl_bignum",
        label: "BIGNUM Math",
        sublabel: "Arbitrary-precision math",
        category: "library",
        description: "Arbitrary-precision integer arithmetic required for public-key cryptography (e.g., multiplying 4096-bit primes for RSA).",
      },
      {
        id: "ossl_rand",
        label: "RAND Subsystem",
        sublabel: "Secure PRNG",
        category: "library",
        description: "Secure pseudorandom number generator (PRNG) seeded from the OS entropy pool (e.g., /dev/urandom).",
      },
    ],
  },
  {
    id: "ossl_libssl",
    label: "libssl",
    sublabel: "TLS / DTLS / QUIC",
    category: "protocol",
    description: "Implements secure network protocols (TLS, DTLS, QUIC). Manages complex state machines for handshakes and data framing, relying entirely on libcrypto for cryptographic operations.",
    children: [
      {
        id: "ossl_tls_sm",
        label: "TLS State Machine",
        sublabel: "Handshake orchestration",
        category: "protocol",
        description: "Manages the back-and-forth communication to establish a secure connection, including cipher negotiation and certificate exchange.",
        children: [
          {
            id: "ossl_handshake",
            label: "Handshake Logic",
            sublabel: "ClientHello → Finished",
            category: "protocol",
            description: "Manages the sequence of ClientHello, ServerHello, Key Exchange, and Certificate validation messages.",
          },
          {
            id: "ossl_alert",
            label: "Alert Handling",
            sublabel: "Fatal & warning signals",
            category: "protocol",
            description: "Processes and generates fatal or warning protocol alerts (e.g., certificate_expired, bad_record_mac).",
          },
        ],
      },
      {
        id: "ossl_record",
        label: "Record Layer",
        sublabel: "Framing & protection",
        category: "protocol",
        description: "Takes application data, breaks it into chunks (max 16 KB), and secures it before transmission using the negotiated AEAD cipher.",
        children: [
          {
            id: "ossl_framing",
            label: "Framing",
            sublabel: "16 KB TLS records",
            category: "protocol",
            description: "Chops continuous application data streams into discrete TLS records (maximum 16 KB each).",
          },
          {
            id: "ossl_recprot",
            label: "Record Protection",
            sublabel: "AEAD encryption",
            category: "protocol",
            description: "Applies the negotiated AEAD ciphers (e.g., AES-GCM, ChaCha20-Poly1305) to each record via the EVP API.",
          },
        ],
      },
      {
        id: "ossl_quic",
        label: "QUIC Subsystem",
        sublabel: "UDP secure transport",
        category: "protocol",
        description: "Introduced in OpenSSL 3.2+. Handles modern UDP-based secure transport with multiplexed streams and reduced connection overhead.",
        children: [
          {
            id: "ossl_quic_mux",
            label: "Stream Multiplexing",
            sublabel: "Concurrent streams / UDP",
            category: "protocol",
            description: "Handles multiple concurrent communication streams over a single UDP connection without head-of-line blocking.",
          },
          {
            id: "ossl_quic_udp",
            label: "UDP Integration",
            sublabel: "Datagram bypass",
            category: "protocol",
            description: "Bypasses traditional TCP socket BIOs to work directly with UDP datagrams.",
          },
        ],
      },
      {
        id: "ossl_session",
        label: "Session Management",
        sublabel: "Connection resumption",
        category: "protocol",
        description: "Handles caching and resumption of previously established connections to save costly cryptographic overhead on reconnects.",
        children: [
          {
            id: "ossl_cache",
            label: "Session Caching",
            sublabel: "In-memory master secrets",
            category: "protocol",
            description: "Stores negotiated master secrets in memory to speed up future connections from the same client.",
          },
          {
            id: "ossl_tickets",
            label: "Stateless Tickets",
            sublabel: "RFC 5077 session tickets",
            category: "protocol",
            description: "Implements RFC 5077 session tickets, allowing servers to offload connection state storage to the client.",
          },
        ],
      },
    ],
  },
  {
    id: "ossl_apps",
    label: "apps/ CLI Tools",
    sublabel: "openssl command-line",
    category: "userspace",
    description: "The `openssl` command-line utility — a user-facing wrapper around libcrypto and libssl for diagnostics, certificate operations, and key management.",
    children: [
      {
        id: "ossl_diag",
        label: "Diagnostic Tools",
        sublabel: "s_client, s_server",
        category: "userspace",
        description: "Commands to spin up barebones TLS clients or servers to test handshakes, cipher suites, and certificate chains.",
      },
      {
        id: "ossl_certops",
        label: "Certificate Ops",
        sublabel: "req, x509, ca",
        category: "userspace",
        description: "Commands like 'req' to generate Certificate Signing Requests and 'x509' to display, edit, and convert certificate files.",
      },
      {
        id: "ossl_keymgmt",
        label: "Key Management",
        sublabel: "genpkey, pkey",
        category: "userspace",
        description: "Commands like 'genpkey' for generating modern private keys (RSA, Ed25519, ECDSA) and 'pkey' for inspecting them.",
      },
    ],
  },
  {
    id: "ossl_provider_arch",
    label: "Provider Architecture",
    sublabel: "Pluggable algorithms",
    category: "service",
    description: "The pluggable architectural model introduced in OpenSSL 3.0. Dynamically loads cryptographic algorithm implementations at runtime, enabling FIPS compliance and hardware offload.",
    children: [
      {
        id: "ossl_provider_core",
        label: "Provider Core",
        sublabel: "Algorithm dispatcher",
        category: "service",
        description: "Central registry inside libcrypto. Routes requests for cryptographic algorithms to the appropriate active Provider, intercepting EVP calls.",
        children: [
          {
            id: "ossl_alg_fetch",
            label: "Algorithm Fetching",
            sublabel: "EVP → provider lookup",
            category: "service",
            description: "Intercepts EVP calls (e.g., 'fetch AES-256-GCM') and searches loaded providers for a valid implementation.",
          },
          {
            id: "ossl_prop_query",
            label: "Property Querying",
            sublabel: "Trait-based selection",
            category: "service",
            description: "Allows requesting algorithms by traits (e.g., 'fips=yes' or 'provider=default') for fine-grained control.",
          },
        ],
      },
      {
        id: "ossl_default_prov",
        label: "Default Provider",
        sublabel: "Standard modern algos",
        category: "service",
        description: "Included out-of-the-box. Contains all standard, modern cryptographic algorithms used in modern TLS handshakes.",
      },
      {
        id: "ossl_legacy_prov",
        label: "Legacy Provider",
        sublabel: "Deprecated algorithms",
        category: "service",
        description: "Contains older deprecated algorithms (MD2, RC4) disabled by default but available for backward compatibility.",
      },
      {
        id: "ossl_fips_prov",
        label: "FIPS Provider",
        sublabel: "FIPS 140 validated",
        category: "service",
        description: "Specialized module with algorithm implementations rigorously tested against US Government FIPS 140 standards.",
      },
      {
        id: "ossl_ext_prov",
        label: "External Providers",
        sublabel: "Third-party & hardware",
        category: "service",
        description: "Custom or hardware-specific providers loaded dynamically by the application for HSMs or specialized accelerators.",
        children: [
          {
            id: "ossl_hsm",
            label: "HSM Integration",
            sublabel: "Hardware security modules",
            category: "service",
            description: "Routes cryptographic operations to physical smart cards or secure enclaves, often via PKCS#11.",
          },
        ],
      },
    ],
  },
];

// ─── Full Linux tree ──────────────────────────────────────────────────────────

const LINUX_TREE: TreeNode = {
  id: "linux",
  label: "Linux",
  sublabel: "Operating System",
  category: "root",
  description: "An open-source Unix-like OS kernel first released in 1991. Underpins the majority of web servers, cloud infrastructure, and embedded devices.",
  children: [
    {
      id: "kernel",
      label: "Linux Kernel",
      sublabel: "v6.x core",
      category: "kernel",
      description: "The core of the OS. Manages hardware resources, process scheduling, memory allocation, device drivers, and exposes system calls to user space.",
      children: [
        { id: "scheduler", label: "CFS Scheduler", sublabel: "Process scheduling", category: "kernel", description: "Completely Fair Scheduler allocates CPU time via a red-black tree ordered by virtual runtime. Ensures no process is starved while maximising throughput." },
        { id: "mm", label: "Memory Manager", sublabel: "Virtual memory", category: "kernel", description: "Manages physical and virtual memory via paging, the buddy allocator, and slab caches. Each process gets an isolated virtual address space." },
        { id: "vfs", label: "VFS Layer", sublabel: "Virtual file system", category: "kernel", description: "Abstraction over concrete file systems (ext4, btrfs, tmpfs, procfs). All file I/O goes through VFS so user-space code is file-system agnostic." },
        {
          id: "netstack", label: "Network Stack", sublabel: "TCP/IP implementation", category: "kernel",
          description: "Full TCP/IP networking in the kernel. Includes socket API, Netfilter hooks (iptables/nftables), and NIC drivers.",
          children: [
            { id: "tcpip", label: "TCP / IP", sublabel: "Transport layer", category: "kernel", description: "Kernel implementation of IPv4/IPv6, TCP, UDP, and ICMP. Handles connection state machines, retransmission timers, and flow control." },
            { id: "netfilter", label: "Netfilter", sublabel: "Packet filtering", category: "kernel", description: "Hook framework for packet inspection, filtering, NAT, and port redirection. The engine behind iptables, nftables, and conntrack." },
          ],
        },
      ],
    },
    {
      id: "libs",
      label: "Core Libraries",
      sublabel: "Shared system layer",
      category: "library",
      description: "Shared libraries every program links against. Bridge user-space code to kernel syscalls and provide optimised implementations of common algorithms.",
      children: [
        { id: "glibc", label: "glibc", sublabel: "GNU C Library", category: "library", description: "Primary C standard library. Wraps kernel syscalls, implements POSIX APIs, provides dynamic linking, locale support, and the standard C runtime." },
        {
          id: "openssl",
          label: "OpenSSL",
          sublabel: "Cryptography & TLS",
          category: "highlight",
          description: "Most widely deployed cryptographic library on Linux. Implements TLS 1.0–1.3, symmetric & asymmetric ciphers, X.509 certificates, and PKCS standards. Used by Apache, nginx, curl, git, OpenSSH, and thousands of packages.",
          children: OPENSSL_CHILDREN,
        },
        { id: "libpthread", label: "libpthread", sublabel: "POSIX threads", category: "library", description: "POSIX threading for Linux. Provides mutexes, condition variables, read-write locks, barriers, thread-local storage, and cancellation points." },
        { id: "libm", label: "libm", sublabel: "Math library", category: "library", description: "Standard C floating-point library. Provides sin, cos, sqrt, pow, and 50+ other functions, optimised with SIMD instructions where available." },
      ],
    },
    {
      id: "services",
      label: "System Services",
      sublabel: "Runtime daemons",
      category: "service",
      description: "Long-running background processes — init, IPC, logging, and remote access.",
      children: [
        { id: "systemd", label: "systemd", sublabel: "Init system (PID 1)", category: "service", description: "First user-space process. Bootstraps all other services, manages lifecycle, handles socket activation, mounts filesystems, runs journald." },
        { id: "dbus", label: "D-Bus", sublabel: "IPC message bus", category: "service", description: "Message-passing system for inter-process communication. Lets processes expose structured APIs across boundaries without shared memory." },
        { id: "openssh", label: "OpenSSH", sublabel: "Remote access", category: "service", description: "Secure shell daemon for encrypted remote terminal sessions. Delegates all cryptographic operations to OpenSSL's libcrypto." },
      ],
    },
    {
      id: "userspace",
      label: "User Space",
      sublabel: "Shell & tooling",
      category: "userspace",
      description: "The user-facing layer: the shell, fundamental CLI utilities, and the package manager.",
      children: [
        { id: "bash", label: "GNU Bash", sublabel: "Default shell", category: "userspace", description: "Bourne Again Shell. Reads commands interactively or from scripts, manages job control, pipes, redirections, and environment variables." },
        { id: "coreutils", label: "GNU Coreutils", sublabel: "Core utilities", category: "userspace", description: "~100 fundamental tools: ls, cp, mv, rm, cat, grep, sort, wc, chmod. Every Linux system depends on these from the very first boot." },
        { id: "apt", label: "apt / dpkg", sublabel: "Package manager", category: "userspace", description: "Debian's package management system. apt fetches packages and resolves dependency graphs; dpkg tracks the installed file manifest." },
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
  protocol:  { bg: "#1d5a8a", border: "#133f66", text: "#e4f0fb",  glow: "rgba(29,90,138,0.45)" },
  crypto:    { bg: "#a05c14", border: "#7a430c", text: "#fff3e6",  glow: "rgba(160,92,20,0.5)" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function allIds(node: TreeNode): string[] {
  return [node.id, ...(node.children ?? []).flatMap(allIds)];
}
const ALL_COLLAPSED = new Set(allIds(LINUX_TREE));

// ─── Component ────────────────────────────────────────────────────────────────

export function SystemDiagram() {
  const [collapsed, setCollapsed] = useState<Set<string>>(ALL_COLLAPSED);
  const containerRef = useRef<HTMLDivElement>(null);
  const containerSize = useRef({ w: 0, h: 0 });
  const collapsedRef = useRef(collapsed);
  const prevRenderedIds = useRef<Set<string>>(new Set());

  const [zoomTarget, setZoomTarget] = useState<string | null>(null);
  const [transform, setTransform] = useState({ tx: 0, ty: 24, s: 1 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => { collapsedRef.current = collapsed; }, [collapsed]);

  const nodes = useMemo<PositionedNode[]>(() => {
    const out: PositionedNode[] = [];
    layout(LINUX_TREE, 0, 0, collapsed, null, out);
    return out;
  }, [collapsed]);

  useLayoutEffect(() => {
    prevRenderedIds.current = new Set(nodes.map((n) => n.node.id));
  }, [nodes]);

  const totalW = useMemo(() => subtreeWidth(LINUX_TREE, collapsed), [collapsed]);
  const totalH = useMemo(() => {
    const maxY = Math.max(...nodes.map((n) => n.y));
    return maxY + NODE_H + 40;
  }, [nodes]);

  const posMap = useMemo(() => {
    const m = new Map<string, PositionedNode>();
    nodes.forEach((n) => m.set(n.node.id, n));
    return m;
  }, [nodes]);

  // ── Transform computation ─────────────────────────────────────────────────

  const computeTransform = useCallback(() => {
    const { w, h } = containerSize.current;
    if (!w || !h) return;

    if (!zoomTarget) {
      // Fit all
      const s = Math.min(w / totalW, h / totalH, 1);
      setTransform({ tx: Math.max(0, (w - totalW * s) / 2), ty: 24, s });
      return;
    }

    const focusPos = posMap.get(zoomTarget);
    if (!focusPos) {
      const s = Math.min(w / totalW, h / totalH, 1);
      setTransform({ tx: Math.max(0, (w - totalW * s) / 2), ty: 24, s });
      return;
    }

    // Bounding box: the expanded node + its direct children
    const children = nodes.filter((n) => n.parentId === zoomTarget);
    const all = [focusPos, ...children];
    const PAD = 56;
    const x0 = Math.min(...all.map((n) => n.x - NODE_W / 2)) - PAD;
    const x1 = Math.max(...all.map((n) => n.x + NODE_W / 2)) + PAD;
    const y0 = focusPos.y - PAD;
    const y1 = Math.max(...all.map((n) => n.y + NODE_H)) + PAD;

    const s = Math.min(w / (x1 - x0), h / (y1 - y0), 2.8);
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;

    setTransform({ tx: w / 2 - cx * s, ty: h / 2 - cy * s, s });
  }, [zoomTarget, totalW, totalH, posMap, nodes]);

  useEffect(() => { computeTransform(); }, [computeTransform]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => {
      const { width, height } = el.getBoundingClientRect();
      containerSize.current = { w: width, h: height };
      computeTransform();
    });
    const { width, height } = el.getBoundingClientRect();
    containerSize.current = { w: width, h: height };
    computeTransform();
    obs.observe(el);
    return () => obs.disconnect();
  }, [computeTransform]);

  // ── Interaction ───────────────────────────────────────────────────────────

  const handleToggle = useCallback((id: string) => {
    const wasCollapsed = collapsedRef.current.has(id);
    setCollapsed((prev) => {
      const next = new Set(prev);
      wasCollapsed ? next.delete(id) : next.add(id);
      return next;
    });
    setZoomTarget(wasCollapsed ? id : null);
  }, []);

  // ── SVG paths ─────────────────────────────────────────────────────────────

  const svgPaths = useMemo(() => {
    return nodes
      .filter((n) => n.parentId !== null)
      .map((n) => {
        const parent = posMap.get(n.parentId!);
        if (!parent) return null;
        const x1 = parent.x, y1 = parent.y + NODE_H;
        const x2 = n.x,     y2 = n.y;
        const cy = (y1 + y2) / 2;
        const isHighlight = n.node.category === "highlight" || n.node.category === "crypto";
        return (
          <path
            key={`${n.parentId}-${n.node.id}`}
            d={`M${x1},${y1} C${x1},${cy} ${x2},${cy} ${x2},${y2}`}
            fill="none"
            stroke={isHighlight ? "rgba(196,122,30,0.45)" : "rgba(29,40,38,0.16)"}
            strokeWidth={isHighlight ? 2 : 1.5}
          />
        );
      });
  }, [nodes, posMap]);

  // ── Hover tooltip position ────────────────────────────────────────────────

  const tooltip = useMemo(() => {
    if (!hoveredId) return null;
    const pos = posMap.get(hoveredId);
    const entry = nodes.find((n) => n.node.id === hoveredId);
    if (!pos || !entry) return null;
    const { tx, ty, s } = transform;
    const nodeRightX = (pos.x + NODE_W / 2) * s + tx;
    const nodeTopY = pos.y * s + ty;
    return { node: entry.node, x: nodeRightX + 12, y: nodeTopY };
  }, [hoveredId, posMap, nodes, transform]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="diagram-shell">
      {tooltip && (
        <div className="diagram-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          <div className="diagram-tooltip-badge" style={{ background: CATEGORY_STYLES[tooltip.node.category].bg }}>
            {tooltip.node.label}
          </div>
          <p className="diagram-tooltip-sub">{tooltip.node.sublabel}</p>
          <p className="diagram-tooltip-desc">{tooltip.node.description}</p>
        </div>
      )}

      <div className="diagram-scroll" ref={containerRef}>
        <div
          className="diagram-canvas"
          style={{
            width: totalW,
            height: totalH,
            transform: `translate(${transform.tx}px, ${transform.ty}px) scale(${transform.s})`,
            transformOrigin: "0 0",
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
            const isNew = !prevRenderedIds.current.has(node.id);
            const isCollapsed = collapsed.has(node.id);

            return (
              <button
                key={node.id}
                className={`diagram-node${node.category === "highlight" || node.category === "crypto" ? " highlighted" : ""}${isNew ? " entering" : ""}`}
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
                onClick={() => { if (node.children) handleToggle(node.id); }}
                onMouseEnter={() => setHoveredId(node.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <span className="diagram-node-label">{node.label}</span>
                <span className="diagram-node-sub">{node.sublabel}</span>
                {node.children && (
                  <span className="diagram-node-toggle">
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
