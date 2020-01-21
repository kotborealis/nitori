#pragma once

#include <string>
#include <vector>
#include <map>
#include <optional>

#include "util.hpp"

namespace nitori::processTest {

struct ProcessTestInput {
    std::map<std::string, std::string> fs = {}; //!< Filesystem (filename => content)
    std::string stdin = ""; //!< Standard input
    std::vector<char*> args = {}; //!< CLI args
};

struct ProcessTestOutput {
    std::map<std::string, std::string> fs = {}; //!< Expected filesystem (filename => content)
    std::optional<std::string> stdout = {}; //!< Expected standard output
    std::optional<int> exitCode = {}; //!< Expected exit code
};

struct ProcessTestCase {
    ProcessTestInput input;
    ProcessTestOutput output;
};

using ProcessTestSuite = std::vector<ProcessTestCase>;

}