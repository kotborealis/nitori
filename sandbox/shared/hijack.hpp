#pragma once

#include <iostream>

#define HIJACK_STDOUT( )        std::stringstream hijack_stdout; \
                                std::cout.rdbuf(hijack_stdout.rdbuf());

#define HIJACK_STDERR( )        std::stringstream hijack_stderr; \
                                std::cerr.rdbuf(hijack_stderr.rdbuf());

#define HIJACK_STDIN( input )   std::stringstream hijack_stdin(input); \
                                std::cin.rdbuf(hijack_stdin.rdbuf());

extern "C" {
    int __HIJACK_MAIN__(int argc, char** argv);
}

#define HIJACK_MAIN __HIJACK_MAIN__