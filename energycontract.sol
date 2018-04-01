pragma solidity ^0.4.17;

contract Electricity {
    
    
    struct Member {
        address addr;
        string name;
        uint maxEnergy;
        uint dateAdded;
        uint consumedEnergy;
    }
    
    string public Name;
    uint public totalEnergy;
    
    mapping(address => Member) public members;
	mapping(address => bool) public isMember;
    address[] public membersList;
    uint public membersCount;
    
    address[] public requestsList;
    uint public requestsCount;
    
  
    
    function Electricity() public {
        
    }
    

    
    //functions
    function community(string _name, uint _totalEnergy,string name) public {
        owner = msg.sender;
        membersList.push(owner);
        Name = _communityName;
        totalEnergy = _totalEnergy;
        members[owner] = Member(owner, name, totalEnergy, now, true, 0, 0);
		isMember[owner] = true;
        membersCount = 1;
        totalEnergy = 0;
    }
    
   
    
    function isMember(address addr) public constant returns (bool) {
        return isMember[addr];
    }
    
  
    
    function myInfo() public constant returns (address,string,uint,uint,bool,uint256,uint) {
        return (
            members[msg.sender].addr,
            members[msg.sender].name,
            members[msg.sender].maxEnergy,
            members[msg.sender].dateAdded,
        
        );
    }

	
    
    function depositEnergy() public payable onlyMember {
       
        members[msg.sender].deposit += msg.value;
        totalEnergy += msg.value;
    }
    
   
    
    
    
    function transferEnergy(address to, uint energyValue) public onlyMember {
        require(to != msg.sender);
        require(members[msg.sender].energyOwned >= energyCount);
        members[to].energyOwned += energyCount;
        members[msg.sender].energyOwned -= energyCount;
    }
    
    function buyPower(uint sharesCount) public onlyMember payable{
        deposit();
        members[msg.sender].powerBuy += energyCount;
        
    }
    
   

    
    function newRequest(uint256 amount) public onlyMember {
		address request = new request(this,amount,owner);
        requestList.push(request);
		requestsCount++;
        if(!request.send(amount)){
			throw;
		}
    }
}