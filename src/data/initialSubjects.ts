import { Subject } from '../types';

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'dsa',
    name: 'Data Structures and Algorithms',
    code: 'DSA',
    order: 1,
    priority: 'critical',
    weightage: 12,
    icon: 'Network',
    chapters: [
      {
        id: 'dsa-asymptotic',
        name: 'Asymptotic Analysis & Recurrences',
        topics: [
          {
            id: 'dsa-top-1',
            name: 'Asymptotic Notations (Big-O, Omega, Theta, Little-o)',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dsa-top-2',
            name: 'Master Theorem & Recurrence Relations',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dsa-top-3',
            name: 'Substitution & Recursion Tree Methods',
            status: 'not_started',
            confidence: 'average',
            priority: 'medium',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      },
      {
        id: 'dsa-linear',
        name: 'Linear Data Structures',
        topics: [
          {
            id: 'dsa-top-4',
            name: 'Arrays & Row-Major / Column-Major Addressing',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dsa-top-5',
            name: 'Singly, Doubly & Circular Linked Lists',
            status: 'not_started',
            confidence: 'average',
            priority: 'medium',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dsa-top-6',
            name: 'Stacks, Infix to Postfix & Evaluation',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dsa-top-7',
            name: 'Queues, Circular Queues & Deques',
            status: 'not_started',
            confidence: 'average',
            priority: 'medium',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      },
      {
        id: 'dsa-trees',
        name: 'Trees & Binary Search Trees',
        topics: [
          {
            id: 'dsa-top-8',
            name: 'Binary Trees & Tree Traversals (In, Pre, Post, Level)',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dsa-top-9',
            name: 'Binary Search Trees (Search, Insert, Delete, Predecessor/Successor)',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dsa-top-10',
            name: 'AVL Trees & Balancing Rotations (LL, RR, LR, RL)',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dsa-top-11',
            name: 'Tree Properties (Height, Nodes, Leaves Relations)',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      },
      {
        id: 'dsa-heaps',
        name: 'Heaps & Hashing',
        topics: [
          {
            id: 'dsa-top-12',
            name: 'Min/Max Binary Heaps & BuildHeap Algorithm O(N)',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dsa-top-13',
            name: 'HeapSort & Priority Queues Operations',
            status: 'not_started',
            confidence: 'average',
            priority: 'medium',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dsa-top-14',
            name: 'Hash Tables & Collision Resolution (Chaining, Linear/Quadratic Probing)',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      },
      {
        id: 'dsa-sorting',
        name: 'Sorting & Searching',
        topics: [
          {
            id: 'dsa-top-15',
            name: 'QuickSort & Randomized QuickSort Analysis',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dsa-top-16',
            name: 'MergeSort, Space-Time Tradeoffs & Lower Bound Omega(n log n)',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dsa-top-17',
            name: 'Linear-Time Sorts (Counting Sort, Radix Sort)',
            status: 'not_started',
            confidence: 'average',
            priority: 'medium',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      },
      {
        id: 'dsa-graphs',
        name: 'Graph Algorithms',
        topics: [
          {
            id: 'dsa-top-18',
            name: 'Graph Representation (Adj Matrix, Adj List) & BFS/DFS',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dsa-top-19',
            name: 'Topological Sort & Cycle Detection in Directed/Undirected Graphs',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dsa-top-20',
            name: 'Minimum Spanning Trees (Kruskal with Disjoint Set, Prim)',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dsa-top-21',
            name: 'Single-Source Shortest Path (Dijkstra, Bellman-Ford & Negative Cycles)',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      },
      {
        id: 'dsa-paradigm',
        name: 'Dynamic Programming & Greedy Design',
        topics: [
          {
            id: 'dsa-top-22',
            name: 'Greedy Strategy (Huffman Coding, Fractional Knapsack, Activity Selection)',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dsa-top-23',
            name: 'DP: 0/1 Knapsack, Subset Sum & Matrix Chain Multiplication',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dsa-top-24',
            name: 'DP: Longest Common Subsequence (LCS) & Floyd-Warshall All-Pairs',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      }
    ]
  },
  {
    id: 'os',
    name: 'Operating Systems',
    code: 'OS',
    order: 2,
    priority: 'critical',
    weightage: 10,
    icon: 'Cpu',
    chapters: [
      {
        id: 'os-proc',
        name: 'Process Management & Threads',
        topics: [
          {
            id: 'os-top-1',
            name: 'Process States, Transitions & Process Control Block (PCB)',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'os-top-2',
            name: 'Context Switching & System Calls (fork, exec, wait, exit)',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'os-top-3',
            name: 'User-Level vs Kernel-Level Threads & Multithreading Models',
            status: 'not_started',
            confidence: 'average',
            priority: 'medium',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      },
      {
        id: 'os-cpu',
        name: 'CPU Scheduling Algorithms',
        topics: [
          {
            id: 'os-top-4',
            name: 'FCFS Scheduling & Convoy Effect',
            status: 'not_started',
            confidence: 'average',
            priority: 'medium',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'os-top-5',
            name: 'SJF (Preemptive SRTF & Non-Preemptive SJF)',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'os-top-6',
            name: 'Round Robin Scheduling & Time Quantum Selection',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'os-top-7',
            name: 'Priority Scheduling & Multilevel Feedback Queue (MLFQ)',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      },
      {
        id: 'os-sync',
        name: 'Process Synchronization',
        topics: [
          {
            id: 'os-top-8',
            name: 'Critical Section Problem & Requirements (Mutual Exclusion, Progress, Bounded Waiting)',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'os-top-9',
            name: 'Peterson’s Solution & Hardware Instructions (Test-and-Set)',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'os-top-10',
            name: 'Semaphores (Counting, Binary) & Mutex Locks',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'os-top-11',
            name: 'Classical Problems (Producer-Consumer, Reader-Writer, Dining Philosophers)',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      },
      {
        id: 'os-deadlock',
        name: 'Deadlocks',
        topics: [
          {
            id: 'os-top-12',
            name: 'Deadlock Characterization & 4 Necessary Conditions',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'os-top-13',
            name: 'Resource Allocation Graph (RAG) & Cycle Detection',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'os-top-14',
            name: 'Banker’s Algorithm for Deadlock Avoidance (Safe State calculation)',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'os-top-15',
            name: 'Deadlock Prevention & Detection Techniques',
            status: 'not_started',
            confidence: 'average',
            priority: 'medium',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      },
      {
        id: 'os-mem',
        name: 'Memory Management',
        topics: [
          {
            id: 'os-top-16',
            name: 'Contiguous Allocation, Internal & External Fragmentation',
            status: 'not_started',
            confidence: 'average',
            priority: 'medium',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'os-top-17',
            name: 'Paging: Page Table, Address Translation, Multi-level Paging',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'os-top-18',
            name: 'Translation Lookaside Buffer (TLB) & Effective Memory Access Time (EMAT)',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'os-top-19',
            name: 'Segmentation & Paged Segmentation',
            status: 'not_started',
            confidence: 'average',
            priority: 'medium',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      },
      {
        id: 'os-vmem',
        name: 'Virtual Memory & Page Replacement',
        topics: [
          {
            id: 'os-top-20',
            name: 'Demand Paging & Page Fault Handling Routine',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'os-top-21',
            name: 'Page Replacement: FIFO & Belady’s Anomaly',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'os-top-22',
            name: 'Page Replacement: Optimal (OPT) & Least Recently Used (LRU)',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'os-top-23',
            name: 'Thrashing & Working Set Model',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      },
      {
        id: 'os-disk',
        name: 'Storage & File Systems',
        topics: [
          {
            id: 'os-top-24',
            name: 'Disk Scheduling Algorithms (FCFS, SSTF, SCAN, C-SCAN, LOOK)',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'os-top-25',
            name: 'File Allocation Methods (Contiguous, Linked, Indexed/Inodes)',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      }
    ]
  },
  {
    id: 'cn',
    name: 'Computer Networks',
    code: 'CN',
    order: 3,
    priority: 'critical',
    weightage: 9,
    icon: 'Globe',
    chapters: [
      {
        id: 'cn-basics',
        name: 'Basics & Physical Layer',
        topics: [
          {
            id: 'cn-top-1',
            name: 'OSI 7-Layer vs TCP/IP Protocol Architectures',
            status: 'not_started',
            confidence: 'average',
            priority: 'medium',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'cn-top-2',
            name: 'Transmission, Propagation, Queueing & Processing Delays',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'cn-top-3',
            name: 'Framing, Bit Stuffing & Byte Stuffing',
            status: 'not_started',
            confidence: 'average',
            priority: 'medium',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      },
      {
        id: 'cn-dll',
        name: 'Data Link Layer & MAC',
        topics: [
          {
            id: 'cn-top-4',
            name: 'Error Detection: Parity, Checksum & CRC (Cyclic Redundancy Check)',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'cn-top-5',
            name: 'Flow Control: Stop-and-Wait Protocol & Efficiency',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'cn-top-6',
            name: 'Sliding Window Protocols: Go-Back-N & Selective Repeat',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'cn-top-7',
            name: 'Multiple Access: Pure & Slotted ALOHA, CSMA/CD & CSMA/CA',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      },
      {
        id: 'cn-nl',
        name: 'Network Layer & IP Addressing',
        topics: [
          {
            id: 'cn-top-8',
            name: 'IPv4 Header Fields & Datagram Fragmentation',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'cn-top-9',
            name: 'IPv4 Addressing: Subnetting, VLSM, CIDR & Route Aggregation',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'cn-top-10',
            name: 'Routing Algorithms: Distance Vector (Count-to-Infinity) & Link State (OSPF)',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'cn-top-11',
            name: 'Network Protocols: ARP, DHCP, ICMP & NAT',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      },
      {
        id: 'cn-tl',
        name: 'Transport Layer',
        topics: [
          {
            id: 'cn-top-12',
            name: 'UDP Header & Connectionless Semantics',
            status: 'not_started',
            confidence: 'average',
            priority: 'medium',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'cn-top-13',
            name: 'TCP Header, Sequence & Ack Numbers, 3-Way Handshake & Teardown',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'cn-top-14',
            name: 'TCP Congestion Control: Slow Start, AIMD, Fast Retransmit & Recovery',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      },
      {
        id: 'cn-app',
        name: 'Application Layer & Network Security',
        topics: [
          {
            id: 'cn-top-15',
            name: 'DNS: Domain Name Hierarchy, Iterative & Recursive Queries',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'cn-top-16',
            name: 'HTTP (Persistent vs Non-Persistent), SMTP & FTP',
            status: 'not_started',
            confidence: 'average',
            priority: 'medium',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'cn-top-17',
            name: 'Cryptography Basics: Symmetric/Asymmetric, RSA & Digital Signatures',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      }
    ]
  },
  {
    id: 'dbms',
    name: 'Database Management Systems',
    code: 'DBMS',
    order: 4,
    priority: 'critical',
    weightage: 8,
    icon: 'Database',
    chapters: [
      {
        id: 'dbms-er',
        name: 'ER Model & Relational Algebra',
        topics: [
          {
            id: 'dbms-top-1',
            name: 'ER Diagrams, Entities, Cardinality Constraints & Relational Schema Mapping',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dbms-top-2',
            name: 'Relational Algebra: Select, Project, Cross Product, Joins, Division',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dbms-top-3',
            name: 'Tuple Relational Calculus (TRC) & Domain Relational Calculus (DRC)',
            status: 'not_started',
            confidence: 'average',
            priority: 'medium',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      },
      {
        id: 'dbms-sql',
        name: 'SQL Queries',
        topics: [
          {
            id: 'dbms-top-4',
            name: 'SELECT, WHERE, GROUP BY, HAVING & Aggregations',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dbms-top-5',
            name: 'Subqueries, Correlated Subqueries & EXISTS / NOT EXISTS',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dbms-top-6',
            name: 'JOIN Operations (Inner, Left/Right/Full Outer) & NULL values',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      },
      {
        id: 'dbms-norm',
        name: 'Functional Dependencies & Normalization',
        topics: [
          {
            id: 'dbms-top-7',
            name: 'Functional Dependencies, Attribute Closure & Candidate Keys',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dbms-top-8',
            name: 'Canonical Cover / Minimal Cover of FDs',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dbms-top-9',
            name: 'Normal Forms: 1NF, 2NF, 3NF & BCNF',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dbms-top-10',
            name: 'Lossless Join & Dependency Preserving Decompositions',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      },
      {
        id: 'dbms-tx',
        name: 'Transactions & Concurrency Control',
        topics: [
          {
            id: 'dbms-top-11',
            name: 'ACID Properties & Transaction State Diagram',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dbms-top-12',
            name: 'Conflict Serializability & Precedence Graph Method',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dbms-top-13',
            name: 'View Serializability & Blind Writes',
            status: 'not_started',
            confidence: 'average',
            priority: 'medium',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dbms-top-14',
            name: 'Recoverability: Recoverable, Cascadeless & Strict Schedules',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dbms-top-15',
            name: 'Two-Phase Locking (2PL, Strict 2PL, Rigorous 2PL) & Timestamp Ordering',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      },
      {
        id: 'dbms-index',
        name: 'Indexing & B/B+ Trees',
        topics: [
          {
            id: 'dbms-top-16',
            name: 'File Organization, Dense vs Sparse, Primary & Secondary Indexing',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dbms-top-17',
            name: 'B-Trees & B+ Trees: Order, Node Capacity, Search & Insertion Costs',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      }
    ]
  },
  {
    id: 'coa',
    name: 'Computer Organization and Architecture',
    code: 'COA',
    order: 5,
    priority: 'high',
    weightage: 9,
    icon: 'HardDrive',
    chapters: [
      {
        id: 'coa-inst',
        name: 'Instruction Formats & Addressing Modes',
        topics: [
          {
            id: 'coa-top-1',
            name: 'Instruction Formats: 0, 1, 2, 3-Address Instructions & Expanding Opcode',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'coa-top-2',
            name: 'Addressing Modes (Immediate, Direct, Indirect, Indexed, Relative, Base-Register)',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      },
      {
        id: 'coa-alu',
        name: 'ALU & Control Unit Design',
        topics: [
          {
            id: 'coa-top-3',
            name: 'Signed Numbers Representation, 2’s Complement & Range Calculations',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'coa-top-4',
            name: 'IEEE 754 Floating Point Standard (Single & Double Precision)',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'coa-top-5',
            name: 'Hardwired vs Microprogrammed Control Unit (Horizontal vs Vertical)',
            status: 'not_started',
            confidence: 'average',
            priority: 'medium',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      },
      {
        id: 'coa-pipe',
        name: 'Instruction Pipelining',
        topics: [
          {
            id: 'coa-top-6',
            name: 'Pipelining Basics, Clock Cycle Time, Speedup & Efficiency',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'coa-top-7',
            name: 'Pipeline Hazards: Structural, Data (RAW, WAR, WAW) & Operand Forwarding',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'coa-top-8',
            name: 'Control Hazards & Branch Penalty Analysis',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      },
      {
        id: 'coa-cache',
        name: 'Memory Hierarchy & Cache Memory',
        topics: [
          {
            id: 'coa-top-9',
            name: 'Locality of Reference (Spatial & Temporal)',
            status: 'not_started',
            confidence: 'average',
            priority: 'medium',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'coa-top-10',
            name: 'Cache Mapping: Direct, Fully Associative & K-Way Set Associative',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'coa-top-11',
            name: 'Cache Write Policies (Write Through vs Write Back) & Multi-level Cache',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      },
      {
        id: 'coa-io',
        name: 'I/O Organization & Interfacing',
        topics: [
          {
            id: 'coa-top-12',
            name: 'Programmed I/O vs Interrupt-Driven I/O',
            status: 'not_started',
            confidence: 'average',
            priority: 'medium',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'coa-top-13',
            name: 'Direct Memory Access (DMA): Cycle Stealing & Burst Mode',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      }
    ]
  },
  {
    id: 'toc',
    name: 'Theory of Computation',
    code: 'TOC',
    order: 6,
    priority: 'high',
    weightage: 8,
    icon: 'Layers',
    chapters: [
      {
        id: 'toc-fa',
        name: 'Regular Languages & Finite Automata',
        topics: [
          {
            id: 'toc-top-1',
            name: 'DFA Design, Minimum States & NFA to DFA Subset Construction',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'toc-top-2',
            name: 'DFA Minimization (Table Filling / Myhill-Nerode Equivalence)',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'toc-top-3',
            name: 'Regular Expressions & Arden’s Theorem',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'toc-top-4',
            name: 'Closure Properties & Decidability of Regular Languages',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'toc-top-5',
            name: 'Pumping Lemma for Proving Non-Regularity',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      },
      {
        id: 'toc-cfl',
        name: 'Context-Free Languages & Pushdown Automata',
        topics: [
          {
            id: 'toc-top-6',
            name: 'Context-Free Grammars (CFG), Ambiguity & Parse Trees',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'toc-top-7',
            name: 'Deterministic PDA (DPDA) vs Non-Deterministic PDA (NPDA)',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'toc-top-8',
            name: 'Closure Properties & Decidability of CFLs & DCFLs',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      },
      {
        id: 'toc-turing',
        name: 'Turing Machines & Undecidability',
        topics: [
          {
            id: 'toc-top-9',
            name: 'Turing Machine Definitions, Configurations & Languages',
            status: 'not_started',
            confidence: 'average',
            priority: 'medium',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'toc-top-10',
            name: 'Chomsky Hierarchy: Regular, CFL, CSL, Recursive & RE Languages',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'toc-top-11',
            name: 'Halting Problem of Turing Machine & Post Correspondence Problem (PCP)',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'toc-top-12',
            name: 'Rice’s Theorem (First & Second) & Reducibility',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      }
    ]
  },
  {
    id: 'cd',
    name: 'Compiler Design',
    code: 'CD',
    order: 7,
    priority: 'medium',
    weightage: 5,
    icon: 'Terminal',
    chapters: [
      {
        id: 'cd-lex',
        name: 'Lexical Analysis',
        topics: [
          {
            id: 'cd-top-1',
            name: 'Tokens, Patterns, Lexemes & Input Buffering',
            status: 'not_started',
            confidence: 'average',
            priority: 'medium',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'cd-top-2',
            name: 'Counting Tokens in C Code Snippets',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      },
      {
        id: 'cd-parse',
        name: 'Syntax Analysis & Parsing',
        topics: [
          {
            id: 'cd-top-3',
            name: 'Top-Down Parsing: FIRST & FOLLOW Computation',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'cd-top-4',
            name: 'LL(1) Parsing Table Construction & Conflict Identification',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'cd-top-5',
            name: 'Bottom-Up Parsing: LR(0), SLR(1), CLR(1), LALR(1) Parsing Tables & Conflicts',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'cd-top-6',
            name: 'Number of States in LR(0) vs SLR(1) vs CLR(1) vs LALR(1)',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      },
      {
        id: 'cd-sdt',
        name: 'Syntax Directed Translation (SDT)',
        topics: [
          {
            id: 'cd-top-7',
            name: 'Synthesized vs Inherited Attributes',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'cd-top-8',
            name: 'S-Attributed vs L-Attributed SDDs & Evaluation Order',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      },
      {
        id: 'cd-codegen',
        name: 'Intermediate Code & Optimization',
        topics: [
          {
            id: 'cd-top-9',
            name: 'Three-Address Code (TAC), Quadruples, Triples & Indirect Triples',
            status: 'not_started',
            confidence: 'average',
            priority: 'medium',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'cd-top-10',
            name: 'Basic Blocks, Flow Graphs & DAG Representation of Expressions',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'cd-top-11',
            name: 'Code Optimization: Constant Folding, Common Subexpression, Loop Unrolling/Jamming',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'cd-top-12',
            name: 'Runtime Environments & Activation Records (Stack Allocation)',
            status: 'not_started',
            confidence: 'average',
            priority: 'medium',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      }
    ]
  },
  {
    id: 'dl',
    name: 'Digital Logic',
    code: 'DL',
    order: 8,
    priority: 'medium',
    weightage: 5,
    icon: 'Binary',
    chapters: [
      {
        id: 'dl-bool',
        name: 'Boolean Algebra & Minimization',
        topics: [
          {
            id: 'dl-top-1',
            name: 'Boolean Laws, Dual, Complement & Canonical SOP/POS',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dl-top-2',
            name: 'Karnaugh Maps (K-Maps) 2, 3, 4, 5 Variables & Don’t Care Conditions',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dl-top-3',
            name: 'Prime Implicants & Essential Prime Implicants Calculation',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      },
      {
        id: 'dl-comb',
        name: 'Combinational Circuits',
        topics: [
          {
            id: 'dl-top-4',
            name: 'Adders, Subtractors, Ripple Carry & Carry Lookahead Adder Propagation',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dl-top-5',
            name: 'Multiplexers (MUX) & Implementing Logic Functions with MUX',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dl-top-6',
            name: 'Decoders, Encoders, Priority Encoders & Demultiplexers',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      },
      {
        id: 'dl-seq',
        name: 'Sequential Circuits & Counters',
        topics: [
          {
            id: 'dl-top-7',
            name: 'Latches and Flip-Flops (SR, JK, D, T), Characteristic & Excitation Tables',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dl-top-8',
            name: 'Race-Around Condition & Master-Slave JK Flip-Flop',
            status: 'not_started',
            confidence: 'average',
            priority: 'medium',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dl-top-9',
            name: 'Setup Time, Hold Time & Maximum Clock Frequency Calculation',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dl-top-10',
            name: 'Synchronous & Asynchronous (Ripple) Counters & Mod-N Counters',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dl-top-11',
            name: 'Ring Counter, Johnson Counter & State Machines (Mealy vs Moore)',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      }
    ]
  },
  {
    id: 'dm',
    name: 'Discrete Mathematics',
    code: 'DM',
    order: 9,
    priority: 'critical',
    weightage: 8,
    icon: 'Sigma',
    chapters: [
      {
        id: 'dm-logic',
        name: 'Propositional & First Order Logic',
        topics: [
          {
            id: 'dm-top-1',
            name: 'Propositional Logic, Truth Tables & Logical Equivalences',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dm-top-2',
            name: 'First-Order Predicate Logic, Quantifiers & Negations',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dm-top-3',
            name: 'Inference Rules, Validity, Satisfiability & Tautology',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      },
      {
        id: 'dm-set',
        name: 'Sets, Relations & Functions',
        topics: [
          {
            id: 'dm-top-4',
            name: 'Set Identities, Power Sets & Cartesian Products',
            status: 'not_started',
            confidence: 'average',
            priority: 'medium',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dm-top-5',
            name: 'Relations: Reflexive, Symmetric, Transitive & Closures',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dm-top-6',
            name: 'Equivalence Relations & Equivalence Classes Counting',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dm-top-7',
            name: 'Partial Orders, Hasse Diagrams, Lattices & Distributive Lattices',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dm-top-8',
            name: 'Functions: Injective (One-to-One), Surjective (Onto), Bijective Counting',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      },
      {
        id: 'dm-comb',
        name: 'Combinatorics & Recurrence',
        topics: [
          {
            id: 'dm-top-9',
            name: 'Permutations & Combinations (Stars & Bars, Identical Objects)',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dm-top-10',
            name: 'Pigeonhole Principle (PHP) & Generalized PHP Applications',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dm-top-11',
            name: 'Principle of Inclusion-Exclusion & Derangements formula',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dm-top-12',
            name: 'Generating Functions & Linear Homogeneous Recurrences',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      },
      {
        id: 'dm-graph',
        name: 'Graph Theory & Group Theory',
        topics: [
          {
            id: 'dm-top-13',
            name: 'Handshaking Lemma, Degrees, Subgraphs & Isomorphism',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dm-top-14',
            name: 'Eulerian Graphs & Hamiltonian Cycles (Dirac’s / Ore’s conditions)',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dm-top-15',
            name: 'Planar Graphs, Euler’s Formula (V - E + R = 2) & Kuratowski’s Theorem',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dm-top-16',
            name: 'Graph Coloring, Chromatic Number & Trees / Spanning Trees Properties',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'dm-top-17',
            name: 'Groups, Subgroups, Abelian Groups, Lagrange’s Theorem & Cyclic Groups',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      }
    ]
  },
  {
    id: 'em',
    name: 'Engineering Mathematics',
    code: 'EM',
    order: 10,
    priority: 'high',
    weightage: 6,
    icon: 'Calculator',
    chapters: [
      {
        id: 'em-la',
        name: 'Linear Algebra',
        topics: [
          {
            id: 'em-top-1',
            name: 'Matrices, Determinants & Elementary Row Operations',
            status: 'not_started',
            confidence: 'average',
            priority: 'medium',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'em-top-2',
            name: 'Rank of Matrix & System of Linear Equations (AX = B Consistency)',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'em-top-3',
            name: 'Eigenvalues & Eigenvectors Properties',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'em-top-4',
            name: 'Cayley-Hamilton Theorem & Matrix Inverse / Powers',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      },
      {
        id: 'em-calc',
        name: 'Calculus',
        topics: [
          {
            id: 'em-top-5',
            name: 'Limits, Continuity & L’Hopital’s Rule',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'em-top-6',
            name: 'Mean Value Theorems (Rolle’s, Lagrange’s, Cauchy’s)',
            status: 'not_started',
            confidence: 'average',
            priority: 'medium',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'em-top-7',
            name: 'Maxima & Minima (Single & Multivariable Saddle Points)',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'em-top-8',
            name: 'Definite & Multiple Integrals, Change of Order of Integration',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      },
      {
        id: 'em-prob',
        name: 'Probability & Statistics',
        topics: [
          {
            id: 'em-top-9',
            name: 'Axioms of Probability, Conditional Probability & Bayes’ Theorem',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'em-top-10',
            name: 'Discrete Random Variables, PMF, Expectation & Variance',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'em-top-11',
            name: 'Continuous Random Variables & Probability Density Function (PDF)',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'em-top-12',
            name: 'Distributions: Uniform, Binomial, Poisson, Normal & Exponential',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      }
    ]
  },
  {
    id: 'ga',
    name: 'General Aptitude',
    code: 'GA',
    order: 11,
    priority: 'critical',
    weightage: 15,
    icon: 'Brain',
    chapters: [
      {
        id: 'ga-quant',
        name: 'Quantitative Aptitude',
        topics: [
          {
            id: 'ga-top-1',
            name: 'Data Interpretation: Bar Charts, Pie Charts & Tabular Analysis',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'ga-top-2',
            name: 'Ratios, Percentages, Profit and Loss & Mixtures',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'ga-top-3',
            name: 'Time & Work, Pipes & Cisterns',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'ga-top-4',
            name: 'Speed, Time and Distance, Relative Speed & Trains/Boats',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'ga-top-5',
            name: 'Number Series, Divisibility & Modular Arithmetic',
            status: 'not_started',
            confidence: 'average',
            priority: 'medium',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      },
      {
        id: 'ga-verbal',
        name: 'Verbal Aptitude',
        topics: [
          {
            id: 'ga-top-6',
            name: 'English Grammar, Tenses & Subject-Verb Agreement',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'ga-top-7',
            name: 'Vocabulary: Synonyms, Antonyms & Contextual Usage',
            status: 'not_started',
            confidence: 'average',
            priority: 'medium',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'ga-top-8',
            name: 'Reading Comprehension & Critical Inference',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      },
      {
        id: 'ga-spatial',
        name: 'Analytical & Spatial Aptitude',
        topics: [
          {
            id: 'ga-top-9',
            name: 'Deductive Reasoning, Syllogisms & Logical Sequences',
            status: 'not_started',
            confidence: 'average',
            priority: 'high',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          },
          {
            id: 'ga-top-10',
            name: 'Spatial Transformations: Paper Folding, Cutting, Mirror Images & 2D/3D Rotations',
            status: 'not_started',
            confidence: 'average',
            priority: 'critical',
            completedAt: null,
            lastRevisedAt: null,
            nextRevisionAt: null,
            revisionCount: 0,
            notes: '',
            history: []
          }
        ]
      }
    ]
  }
];
