
#include <iostream>
#include <chrono>
#include <cstdlib>
#include <string>
#include <fstream>

using namespace std;
using namespace chrono;

struct Server {
    string id;
    int port;
};

int main() {

    Server servers[] = {
        {"server-1", 5001},
        {"server-2", 5002},
        {"server-3", 5003},
        {"server-4", 5004}
    };

    int totalServers = 4;

    while (true) {

        cout << "\n=====================================\n";
        cout << "      NetRoute AI Network Monitor\n";
        cout << "=====================================\n";

        ofstream jsonFile("network_status.json");

        jsonFile << "[\n";

        for (int i = 0; i < totalServers; i++) {

            const auto& server = servers[i];

            string url =
                "http://localhost:" +
                to_string(server.port) +
                "/health";

            cout << "\nChecking "
                 << server.id << "... ";

            auto start = steady_clock::now();

            string command =
                "curl.exe -s --fail --max-time 5 " +
                url +
                " > response.txt";

            int result = system(command.c_str());

            auto end = steady_clock::now();

            long long latency =
                duration_cast<milliseconds>(
                    end - start
                ).count();

            string status;
            int packetLoss;

            if (result != 0) {

                status = "DOWN";
                packetLoss = 100;

                cout << "DOWN"
                     << " | Request failed";

            }
            else if (latency > 1000) {

                status = "DEGRADED";
                packetLoss = 0;

                cout << "DEGRADED"
                     << " | High Latency: "
                     << latency
                     << " ms";

            }
            else {

                status = "UP";
                packetLoss = 0;

                cout << "UP"
                     << " | Latency: "
                     << latency
                     << " ms";
            }

            // Save complete monitoring data
            jsonFile << "  {\n";

            jsonFile << "    \"serverId\": \""
                     << server.id
                     << "\",\n";

            jsonFile << "    \"latencyMs\": "
                     << latency
                     << ",\n";

            jsonFile << "    \"packetLossPercent\": "
                     << packetLoss
                     << ",\n";

            jsonFile << "    \"loadPercent\": 0,\n";

            jsonFile << "    \"status\": \""
                     << status
                     << "\"\n";

            jsonFile << "  }";

            if (i < totalServers - 1) {
                jsonFile << ",";
            }

            jsonFile << "\n";

            /*
             * Send THIS server's data to Java Backend.
             *
             * We create a temporary JSON object because
             * Java NetworkStatusController expects ONE object,
             * not the complete JSON array.
             */

            ofstream singleJson("server_status.json");

            singleJson << "{\n";

            singleJson << "  \"serverId\": \""
                       << server.id
                       << "\",\n";

            singleJson << "  \"latencyMs\": "
                       << latency
                       << ",\n";

            singleJson << "  \"packetLossPercent\": "
                       << packetLoss
                       << ",\n";

            singleJson << "  \"loadPercent\": 0,\n";

            singleJson << "  \"status\": \""
                       << status
                       << "\"\n";

            singleJson << "}\n";

            singleJson.close();

            // POST to Phase 2 Java Backend
            string postCommand =
                "curl.exe -s -X POST "
                "http://localhost:8080/api/network-status "
                "-H \"Content-Type: application/json\" "
                "--data-binary @server_status.json";

            int postResult =
                system(postCommand.c_str());

            if (postResult == 0) {

                cout << " | Sent to Java";

            }
            else {

                cout << " | Java POST failed";
            }
        }

        jsonFile << "]\n";
        jsonFile.close();

        cout << "\n\nJSON updated: network_status.json\n";

        cout << "Phase 1 -> Phase 2 data transfer completed.\n";

        cout << "Next check in 3 seconds...\n";

        system("timeout /t 3 /nobreak > nul");
    }

    return 0;
}

