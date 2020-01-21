#pragma once

#define CATCH_CONFIG_MAIN
#include "catch.hpp"

#include <iostream>
#include <fstream>
#include <cctype>
#include <locale>

#include <cstdio>

extern "C" {
    int __NITORI_HIJACK_MAIN__(int argc, char** argv);
}

#include "util.hpp"
#include "processTest.hpp"

namespace nitori {

/**
 * Hijack stdout
 */
void hijack_stdout() {
    freopen(".stdout", "w", stdout);
}

/**
 * Restore stdout
 */
void restore_stdout() {
    freopen("/dev/tty", "w", stdout);
}

/**
 * Hijack stderr
 */
void hijack_stderr() {
    freopen(".stderr", "w", stderr);
}

/**
 * Restore stderr
 */
void restore_stderr() {
    freopen("/dev/tty", "w", stderr);
}

/**
 * Hijack stdin
 *
 * @param value stdin value
 */
void hijack_stdin(std::string value = "") {
    freopen(".stdin", "w", stdin);
    fprintf(stdin, value.c_str());
    freopen(".stdin", "r", stdin);
}

/**
 * Restore stdin
 */
void restore_stdin() {
    freopen("/dev/tty", "r", stdin);
}

/**
 * Get stdout
 * @param trim Trim return value? True by default
 */
std::string stdout(bool trim = true) {
    auto content = util::readFile(".stdout");
    return trim ? util::trim(content) : content;
}

/**
 * Get stderr
 * @param trim Trim return value? True by default
 */
std::string stderr(bool trim = true) {
    auto content = util::readFile(".stderr");
    return trim ? util::trim(content) : content;
}

/**
 * Get stdin
 * @param trim Trim return value? True by default
 */
std::string stdin(bool trim = true) {
    auto content = util::readFile(".stdin");
    return trim ? util::trim(content) : content;
}

/**
 * Hijack stdin alias
 *
 * @param value stdin value
 */
void stdin(std::string value = "") {
    hijack_stdin(value);
}

/**
 * Call hijacked main with classic argc & argv
 * Automaticly hijacks and restores stdout and stderr
 *
 * @param argc
 * @param argv
 */
int main(int argc, char** argv) {
    nitori::hijack_stdout();
    auto exitCode = __NITORI_HIJACK_MAIN__(argc, argv);
    nitori::restore_stdout();
    nitori::restore_stdin();

    return exitCode;
}

/**
 * Call hijacked main with vector args and default program name
 * Automaticly hijacks and restores stdout and stderr
 *
 * @param args Vector with arguments, except argv[0] (program name)
 */
int main(std::vector<char*> args) {
    args.insert(args.begin(), "hijacked_main_call");

    int argc = args.size();
    char **argv = &args[0];

    return ::nitori::main(argc, argv);
}

/**
 * Call hijacked main without args
 * Automaticly hijacks and restores stdout and stderr
 */
int main() {
    return ::nitori::main({});
}

int main(::nitori::processTest::ProcessTestCase test) {

    for(auto const& [filename, content] : test.fsin)
        ::nitori::util::writeFile(filename, content);

    ::nitori::stdin(test.stdin);

    auto exitCode = ::nitori::main(test.args);

    if(test.exitCode.has_value()) {
        auto expectedExitCode = *test.exitCode;
        REQUIRE(exitCode == expectedExitCode);
    }

    if(test.stdout.has_value()) {
        auto stdout = nitori::stdout();
        auto expectedStdout = util::trim(*test.stdout);

        REQUIRE(stdout == expectedStdout);
    }

    for(auto const& [filename, expectedContent] : test.fsout) {
        auto content = util::trim(
            util::readFile(filename)
        );

        REQUIRE(content == expectedContent);
    }

    return exitCode;
}

void main(::nitori::processTest::ProcessTestSuite suite) {
    auto test = GENERATE_REF(from_range(suite.begin(), suite.end()));
    ::nitori::main(test);
}

}