#pragma once

#include <iostream>

std::stringstream hijack_stdout;
std::stringstream hijack_stderr;
std::stringstream hijack_stdin;

#define HIJACK_STDOUT( )        do { \
                                    hijack_stdout.str(""); \
                                    std::cout.rdbuf(hijack_stdout.rdbuf()); \
                                } while(0)

#define HIJACK_STDERR( )        do { \
                                    hijack_stderr.str(""); \
                                    std::cerr.rdbuf(hijack_stderr.rdbuf()); \
                                } while(0)

#define HIJACK_STDIN( INPUT )   do { \
                                    hijack_stdin.str(INPUT); \
                                    std::cin.rdbuf(hijack_stdin.rdbuf()); \
                                } while(0)

extern "C" {
    int __HIJACK_MAIN__(int argc, char** argv);
}

#define HIJACK_MAIN __HIJACK_MAIN__