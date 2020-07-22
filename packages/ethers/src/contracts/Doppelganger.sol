/* solium-disable security/no-inline-assembly */
pragma solidity ^0.6.3;

contract Doppelganger {
    struct MockCall {
        bool initialized;
        bool reverts;
        bytes returnValue;
    }

    mapping(bytes32 => MockCall) mockConfig;

    fallback() external payable {
        MockCall storage mockCall = __doppelganger__internal__getMockCall();
        if (mockCall.reverts == true) {
            __doppelganger__internal__mockRevert();
            return;
        }

        __doppelganger__internal__mockReturn(mockCall.returnValue);
    }

    function __doppelganger__mockReverts(bytes memory data) public {
        mockConfig[keccak256(data)] = MockCall({
            initialized: true,
            reverts: true,
            returnValue: ""
        });
    }

    function __doppelganger__mockReturns(bytes memory data, bytes memory value)
        public
    {
        mockConfig[keccak256(data)] = MockCall({
            initialized: true,
            reverts: false,
            returnValue: value
        });
    }

    function __doppelganger__internal__getMockCall()
        private
        view
        returns (MockCall storage mockCall)
    {
        mockCall = mockConfig[keccak256(msg.data)];
        if (mockCall.initialized == true) {
            // Mock method with specified arguments
            return mockCall;
        }
        mockCall = mockConfig[keccak256(abi.encodePacked(msg.sig))];
        if (mockCall.initialized == true) {
            // Mock method with any arguments
            return mockCall;
        }
        revert("Mock on the method is not initialized");
    }

    function __doppelganger__internal__mockReturn(bytes memory ret)
        private
        pure
    {
        assembly {
            return(add(ret, 0x20), mload(ret))
        }
    }

    function __doppelganger__internal__mockRevert() private pure {
        revert("Mock revert");
    }
}
